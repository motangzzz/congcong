"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Props = {
  messageId: string;
  initialCount: number;
  initialLiked: boolean;
};

export default function LikeButton({ messageId, initialCount, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  async function handleToggle() {
    // 乐观更新
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));
    if (newLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    if (newLiked) {
      // 点赞
      const { error } = await supabase.from("likes").insert({
        user_id: session.user.id,
        message_id: messageId,
      });
      if (error) {
        // 回滚
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      // 取消点赞
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", session.user.id)
        .eq("message_id", messageId);

      if (error) {
        // 回滚
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
        transition-all duration-200 select-none
        ${liked
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }
      `}
    >
      <span
        className={`
          transition-transform duration-300 inline-block
          ${animating ? "scale-125" : ""}
          ${liked ? "animate-wiggle" : ""}
        `}
        style={{ animationDuration: liked ? "0.6s" : "0s" }}
      >
        {liked ? "❤️" : "🤍"}
      </span>
      <span className="font-medium">{count || "赞"}</span>
    </button>
  );
}
