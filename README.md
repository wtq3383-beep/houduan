# Personal Notes Site

部署目标：

- 前端和接口全部部署到 Vercel
- 图片存储使用 Vercel Blob
- 笔记结构化数据使用 Vercel Marketplace 接入的 Postgres
- 通过站内登录和 Cookie 会话做单用户访问控制

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

## Vercel 部署

截至 `2026-04-15`：

- `Vercel Blob` 可直接用于图片存储
- `Vercel Postgres` 新项目不再按旧方式提供，建议通过 `Vercel Marketplace` 安装 `Neon` 这类 Postgres 集成

部署顺序：

1. 推送到 GitHub
2. 在 Vercel 导入仓库
3. 添加 Blob 存储
4. 在 Marketplace 安装 Neon 或其他 Postgres
5. 注入环境变量
6. 部署
