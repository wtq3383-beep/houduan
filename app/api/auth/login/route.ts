import { NextResponse } from "next/server";
import {
  createSessionToken,
  getLoginCredentials,
  getSessionCookieName,
  getSessionMaxAge
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const credentials = getLoginCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set({
    name: getSessionCookieName(),
    value: createSessionToken(credentials.username),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAge()
  });

  return response;
}
