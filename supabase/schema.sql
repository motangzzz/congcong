-- ============================================
-- 匆匆那年 - 数据库建表脚本
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 1. 用户表
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 留言表
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 点赞表
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- 索引
CREATE INDEX idx_messages_parent_id ON public.messages(parent_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC NULLS LAST);
CREATE INDEX idx_likes_message_id ON public.likes(message_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "所有人可查看用户" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "用户可创建自己的资料" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "用户可更新自己的资料" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- 留言表策略
CREATE POLICY "所有人可查看留言" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "登录用户可发布留言" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "用户可更新自己的留言" ON public.messages
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "用户可删除自己的留言" ON public.messages
  FOR DELETE USING (user_id = auth.uid());

-- 点赞表策略
CREATE POLICY "所有人可查看点赞" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "登录用户可点赞" ON public.likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "用户可取消自己的点赞" ON public.likes
  FOR DELETE USING (user_id = auth.uid());
