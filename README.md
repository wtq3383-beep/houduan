# Personal Notes Site

一个部署到 Vercel 的单用户笔记网站：

- 前端和接口都运行在 Next.js
- 图片存储使用 Vercel Blob
- 笔记数据使用 Vercel Marketplace 接入的 Postgres
- 通过站内登录和 Cookie 会话做访问控制
- 正文支持 Markdown 编辑和预览

## 环境变量

复制 `.env.example` 到 `.env.local`，然后填写：

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `LOGIN_USERNAME`
- `LOGIN_PASSWORD`
- `SESSION_SECRET`

## 本地开发

```bash
npm install
npm run dev
```

## 数据库初始化

项目根目录提供了完整初始化脚本：

[`schema_complete.sql`](C:/Users/ASUS/houduan/schema_complete.sql)

如果你在本地或外部数据库工具中手动初始化，可以执行：

```sql
\i schema_complete.sql
```

或者直接复制脚本内容执行。

这个脚本会创建：

- `notes` 表
- `created_at` / `updated_at` 索引
- 自动维护 `updated_at` 的 trigger

说明：

- 当前代码里仍然保留了 `ensureNotesTable()` 作为兜底逻辑
- 线上更推荐先执行 `schema_complete.sql`，再让应用连接数据库

## Vercel 部署

截至 `2026-04-16`：

- `Vercel Blob` 可直接用于图片存储
- `Vercel Postgres` 新项目不再按旧方式提供，建议通过 `Vercel Marketplace` 安装 `Neon` 这类 Postgres 集成

部署顺序：

1. 推送到 GitHub
2. 在 Vercel 导入仓库
3. 添加 Blob 存储
4. 在 Marketplace 安装 Neon 或其他 Postgres
5. 注入环境变量
6. 部署
