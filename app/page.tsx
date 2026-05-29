"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { AVATARS, getRandomAvatar } from "@/lib/avatars";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "login" | "setup" | "enter">("loading");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // 已有会话，检查是否已有资料
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (user) {
        // 已有资料，直接进入
        router.replace("/board");
      } else {
        // 需要填写资料
        setStep("setup");
      }
    } else {
      setStep("login");
    }
  }

  async function handleAnonymousLogin() {
    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        setError("登录失败：" + error.message);
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        setStep("setup");
      }
    } catch (err: unknown) {
      setError("网络错误，请重试");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetup() {
    if (!nickname.trim()) {
      setError("起个昵称吧！");
      return;
    }
    if (nickname.trim().length > 20) {
      setError("昵称不能超过20个字哦");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("会话已过期，请刷新重试");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("users").insert({
        id: session.user.id,
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      });

      if (error) {
        if (error.code === "23505") {
          setError("这个昵称已经被抢了，换一个吧！");
        } else {
          setError("保存失败：" + error.message);
        }
        setIsSubmitting(false);
        return;
      }

      router.replace("/board");
    } catch (err: unknown) {
      setError("网络错误，请重试");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // 加载中
  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌸</div>
          <p className="text-gray-500 animate-pulse">加载中...</p>
        </div>
      </div>
    );
  }

  // 登录页
  if (step === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="text-7xl mb-4 animate-float">🍊</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">匆匆那年</h1>
          <p className="text-gray-500 mb-8">属于我们的回忆小窝 🏠</p>

          {/* 进入按钮 */}
          <button
            onClick={handleAnonymousLogin}
            disabled={isSubmitting}
            className="
              bg-gradient-to-r from-warm-400 to-rose-400
              text-white text-lg font-semibold
              px-10 py-4 rounded-full
              shadow-lg hover:shadow-xl
              transition-all duration-300
              hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? "加载中..." : "点 击 进 入 🚀"}
          </button>

          <p className="text-gray-400 text-sm mt-6">
            不需要手机号，不需要密码，进来就是朋友～
          </p>
        </div>
      </div>
    );
  }

  // 设置资料
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">给自己起个名儿 😄</h2>
          <p className="text-gray-400 text-sm mt-1">选个喜欢的头像和昵称吧</p>
        </div>

        {/* 选头像 */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-3 text-sm">
            选个头像 👇
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.emoji}
                onClick={() => setSelectedAvatar(a.emoji)}
                className={`
                  text-2xl p-2 rounded-xl transition-all duration-200
                  hover:bg-warm-100 hover:scale-110
                  ${selectedAvatar === a.emoji
                    ? "bg-warm-200 ring-2 ring-warm-400 scale-110 shadow"
                    : "bg-gray-50"
                  }
                `}
                title={a.name}
              >
                {a.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 输入昵称 */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2 text-sm">
            输入昵称 ✏️
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSetup()}
            placeholder="你的名字是..."
            maxLength={20}
            className="
              w-full px-4 py-3 rounded-xl border-2 border-warm-200
              focus:border-warm-400 focus:outline-none
              bg-white/50 placeholder-gray-300
              text-gray-700 text-lg
              transition-colors
            "
            autoFocus
          />
          <p className="text-gray-400 text-xs mt-1 text-right">{nickname.length}/20</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* 确认按钮 */}
        <button
          onClick={handleSetup}
          disabled={isSubmitting || !nickname.trim()}
          className="
            w-full bg-gradient-to-r from-warm-400 to-rose-400
            text-white font-semibold py-3 rounded-xl
            shadow-md hover:shadow-lg
            transition-all duration-300
            hover:scale-[1.02] active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? "加载中..." : "进 入 匆 匆 那 年 ✨"}
        </button>
      </div>
    </div>
  );
}
