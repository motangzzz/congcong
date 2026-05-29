# 🍊 匆匆那年

属于我们的小世界 —— 留言板 + 点赞

## ✨ 功能

- 📝 **留言**：支持富文本（加粗、列表、引用、代码块等）
- 💬 **回复**：楼中楼回复，想聊就聊
- ❤️ **点赞**：每人每条留言只能点一次
- 🎭 **匿名登录**：取个昵称 + 选个搞怪头像即可
- 🌈 **温馨搞笑风**：暖色调设计，有那味儿了

## 🚀 快速开始

### 1. 注册 Supabase

打开 [supabase.com](https://supabase.com) 并注册（免费）。

### 2. 创建项目

在 Supabase 中创建一个新项目，记下：
- **Project URL**（项目 URL）
- **Anon Key**（匿名密钥）

在项目 Settings → API 中可以找到。

### 3. 启用匿名登录

在 Supabase 控制台：
1. 左侧菜单 → **Authentication** → **Providers**
2. 找到 **Anonymous**，点击开启（Enable）
3. 保存

### 4. 运行数据库脚本

1. 在 Supabase 控制台打开 **SQL Editor**
2. 复制 `supabase/schema.sql` 的全部内容
3. 粘贴到 SQL Editor 中并运行

### 5. 配置项目

```bash
# 复制环境变量模板
cp .env.local.example .env.local
```

编辑 `.env.local`，填上你的 Supabase URL 和 Anon Key：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
```

### 6. 安装并运行

```bash
# 安装依赖
npm install

# 本地开发
npm run dev
```

浏览器打开 `http://localhost:3000` 就能用了！

### 7. 部署到 Vercel（免费）

1. 把代码推到 GitHub
2. 打开 [vercel.com](https://vercel.com) 并注册
3. 选择你的仓库，点击 Import
4. 在环境变量中填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 部署！Vercel 会自动给你一个域名

## 📁 项目结构

```
congcongnanian/
├── app/
│   ├── page.tsx          # 登录/设置页
│   ├── board/page.tsx    # 留言板主页
│   ├── layout.tsx        # 根布局
│   └── globals.css       # 全局样式
├── components/
│   ├── NavBar.tsx        # 导航栏
│   ├── MessageCard.tsx   # 留言卡片
│   ├── MessageEditor.tsx # 富文本编辑器
│   └── LikeButton.tsx    # 点赞按钮
├── lib/
│   ├── supabase-client.ts # 客户端 Supabase
│   ├── supabase-server.ts # 服务端 Supabase
│   ├── types.ts           # 类型定义
│   └── avatars.ts         # 头像预设
├── supabase/
│   └── schema.sql         # 数据库建表脚本
└── middleware.ts           # 会话中间件
```

## 🛠 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Anonymous Auth
- **富文本**: TipTap
- **样式**: Tailwind CSS
- **部署**: Vercel + Supabase（均免费）
