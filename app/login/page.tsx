import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, isValidSessionToken } from "@/lib/auth";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "登录",
  description: "个人笔记登录页"
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (isValidSessionToken(token)) {
    redirect("/");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Personal Access</p>
          <h1>登录你的笔记库</h1>
          <p>
            这是单用户版本。登录后可以查看、编辑、上传图片，并通过浏览器 Cookie 保持会话。
          </p>
        </div>

        <form action="/api/auth/login" method="post" className={styles.form}>
          <label className={styles.field}>
            <span>用户名</span>
            <input name="username" type="text" autoComplete="username" required />
          </label>

          <label className={styles.field}>
            <span>密码</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          <button type="submit" className={styles.submit}>
            登录
          </button>
        </form>
      </section>
    </main>
  );
}
