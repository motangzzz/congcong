"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@/lib/types";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data) setUser(data);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-warm-200/50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 左边 - Logo */}
        <button
          onClick={() => router.push("/board")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🍊</span>
          <span className="text-xl font-bold text-gray-800">匆匆那年</span>
        </button>

        {/* 右边 - 用户信息 */}
        <div className="relative">
          {user && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-warm-50 hover:bg-warm-100 transition-colors"
            >
              <span className="text-xl">{user.avatar}</span>
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                {user.nickname}
              </span>
            </button>
          )}

          {/* 下拉菜单 */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 z-20 bg-white rounded-2xl shadow-xl border border-warm-200 py-2 min-w-[160px]">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-400">当前身份</p>
                  <p className="font-medium text-gray-700">
                    {user?.avatar} {user?.nickname}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50 transition-colors"
                >
                  换个身份 🚪
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
