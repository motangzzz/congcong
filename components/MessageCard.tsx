"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { Message } from "@/lib/types";
import LikeButton from "./LikeButton";
import MessageEditor from "./MessageEditor";

type Props = {
  message: Message;
  currentUserId?: string;
  depth?: number;
  onReplyAdded?: () => void;
};

export default function MessageCard({
  message,
  currentUserId,
  depth = 0,
  onReplyAdded,
}: Props) {
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [replies, setReplies] = useState<Message[]>(message.replies || []);

  const isOwner = currentUserId === message.user_id;
  const time = formatTime(message.created_at);

  async function handleSubmitReply() {
    if (!replyContent.trim() || replyContent === "<p></p>") return;

    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: session.user.id,
        content: replyContent,
        parent_id: message.id,
      })
      .select("*, user:users(*)")
      .single();

    if (!error && data) {
      setReplies((prev) => [...prev, data as unknown as Message]);
      setReplyContent("");
      setShowReplyEditor(false);
      setShowReplies(true);
      onReplyAdded?.();
    }

    setSubmitting(false);
  }

  return (
    <div
      className={`
        ${depth > 0 ? "ml-4 sm:ml-8 border-l-2 border-warm-200/50 pl-4" : ""}
      `}
    >
      {/* 主卡片 */}
      <div
        className={`
          bg-white rounded-2xl p-4 shadow-sm
          ${depth === 0 ? "border border-warm-200/50" : ""}
          hover:shadow-md transition-shadow
        `}
      >
        {/* 用户信息行 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{message.user?.avatar || "👤"}</span>
            <span className="font-medium text-gray-700 text-sm">
              {message.user?.nickname || "匿名用户"}
            </span>
            {isOwner && (
              <span className="text-[10px] bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded-full">
                我
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{time}</span>
        </div>

        {/* 留言内容 */}
        <div
          className="message-content text-gray-700 text-[15px] leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />

        {/* 操作栏 */}
        <div className="flex items-center gap-3">
          <LikeButton
            messageId={message.id}
            initialCount={message.likes_count || 0}
            initialLiked={message.is_liked || false}
          />
          <button
            onClick={() => setShowReplyEditor(!showReplyEditor)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
          >
            💬 回复
          </button>
        </div>
      </div>

      {/* 回复编辑器 */}
      {showReplyEditor && (
        <div className="ml-4 sm:ml-8 mt-3 space-y-2">
          <MessageEditor
            placeholder={`回复 ${message.user?.nickname || "匿名用户"}...`}
            onChange={setReplyContent}
            minHeight={80}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowReplyEditor(false);
                setReplyContent("");
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmitReply}
              disabled={submitting || !replyContent.trim() || replyContent === "<p></p>"}
              className="
                px-5 py-2 text-sm font-medium rounded-xl
                bg-gradient-to-r from-warm-400 to-rose-400 text-white
                hover:shadow-md transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {submitting ? "发送中..." : "发送 💬"}
            </button>
          </div>
        </div>
      )}

      {/* 回复列表展开/收起 */}
      {replies.length > 0 && (
        <div className="mt-2">
          {!showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-4 sm:ml-8 text-sm text-warm-500 hover:text-warm-700 transition-colors"
            >
              查看 {replies.length} 条回复 ▼
            </button>
          )}
          {showReplies && (
            <div className="mt-2 space-y-2">
              {replies.map((reply) => (
                <MessageCard
                  key={reply.id}
                  message={reply}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
