"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import type { Message, User } from "@/lib/types";
import NavBar from "@/components/NavBar";
import MessageCard from "@/components/MessageCard";
import MessageEditor from "@/components/MessageEditor";

export default function BoardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewEditor, setShowNewEditor] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 检查登录并获取数据
  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/");
      return;
    }

    // 获取用户资料
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!userData) {
      router.replace("/");
      return;
    }

    setUser(userData);

    // 获取所有顶级留言（按时间倒序）
    const { data: messagesData } = await supabase
      .from("messages")
      .select(`
        *,
        user:users(*)
      `)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (!messagesData) {
      setLoading(false);
      return;
    }

    // 对每条留言获取点赞数和回复
    const enrichedMessages = await Promise.all(
      (messagesData as unknown as Message[]).map(async (msg) => {
        // 点赞数
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("message_id", msg.id);

        // 当前用户是否点赞
        const { data: likeData } = await supabase
          .from("likes")
          .select("*")
          .eq("message_id", msg.id)
          .eq("user_id", session.user.id)
          .maybeSingle();

        // 获取回复
        const { data: repliesData } = await supabase
          .from("messages")
          .select(`
            *,
            user:users(*)
          `)
          .eq("parent_id", msg.id)
          .order("created_at", { ascending: true });

        // 对回复也获取点赞信息
        const enrichedReplies = await Promise.all(
          (repliesData as unknown as Message[] || []).map(async (reply) => {
            const { count: replyLikes } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("message_id", reply.id);

            const { data: replyLike } = await supabase
              .from("likes")
              .select("*")
              .eq("message_id", reply.id)
              .eq("user_id", session.user.id)
              .maybeSingle();

            return {
              ...reply,
              likes_count: replyLikes || 0,
              is_liked: !!replyLike,
            };
          })
        );

        return {
          ...msg,
          likes_count: likesCount || 0,
          is_liked: !!likeData,
          replies: enrichedReplies,
        };
      })
    );

    setMessages(enrichedMessages);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 发布新留言
  async function handleNewMessage() {
    if (!newContent.trim() || newContent === "<p></p>") return;

    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: session.user.id,
        content: newContent,
        parent_id: null,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (!error && data) {
      const newMsg: Message = {
        ...(data as unknown as Message),
        likes_count: 0,
        is_liked: false,
        replies: [],
      };
      setMessages((prev) => [newMsg, ...prev]);
      setNewContent("");
      setShowNewEditor(false);
    }

    setSubmitting(false);
  }

  // 刷新
  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    await fetchData();
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* 顶部问候 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {user?.avatar} {user?.nickname} 来啦～
          </h1>
          <p className="text-gray-400 text-sm">留下你想说的话吧 📝</p>
        </div>

        {/* 快捷发布按钮 */}
        {!showNewEditor && (
          <button
            onClick={() => setShowNewEditor(true)}
            className="
              w-full mb-6 p-4 rounded-2xl border-2 border-dashed border-warm-200
              text-warm-400 hover:text-warm-500 hover:border-warm-400
              hover:bg-warm-50/50 transition-all
              text-lg font-medium
            "
          >
            + 写点什么...
          </button>
        )}

        {/* 新留言编辑器 */}
        {showNewEditor && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-warm-200/50">
            <MessageEditor
              onChange={setNewContent}
              placeholder="此时此刻，你想说..."
            />
            <div className="flex gap-2 justify-end mt-3">
              <button
                onClick={() => {
                  setShowNewEditor(false);
                  setNewContent("");
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleNewMessage}
                disabled={submitting || !newContent.trim() || newContent === "<p></p>"}
                className="
                  px-6 py-2 text-sm font-medium rounded-xl
                  bg-gradient-to-r from-warm-400 to-rose-400 text-white
                  hover:shadow-md transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {submitting ? "发布中..." : "发布 ✨"}
              </button>
            </div>
          </div>
        )}

        {/* 留言列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl text-gray-500 mb-2">还没有留言</h2>
            <p className="text-gray-400">来做第一个留言的人吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                currentUserId={user?.id}
                onReplyAdded={fetchData}
              />
            ))}
          </div>
        )}

        {/* 底部信息 */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          <p>匆匆那年 · 属于我们的小世界 🌍</p>
        </div>
      </div>

      {/* 悬浮刷新按钮 */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="
          fixed bottom-6 right-6 z-40
          w-12 h-12 rounded-full
          bg-white/80 backdrop-blur-sm shadow-lg
          border border-warm-200/50
          flex items-center justify-center
          text-xl hover:bg-warm-50
          transition-all hover:scale-110 active:scale-95
          disabled:opacity-50
        "
        title="刷新"
      >
        <span className={`inline-block ${refreshing ? "animate-spin" : ""}`}>
          🔄
        </span>
      </button>
    </div>
  );
}
