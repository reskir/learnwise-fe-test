import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function POST() {
  if (!process.env.ASSISTANT_ID) {
    return NextResponse.json(
      { error: "Server misconfiguration: ASSISTANT_ID is missing" },
      { status: 500 }
    );
  }

  const url = new URL(
    "/chat/sign-in/injector",
    process.env.BASE_API_URL || "https://api.sandbox.learnwise.dev"
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-assistant-id": process.env.ASSISTANT_ID,
    },
    body: JSON.stringify({
      name: "Test User",
      roles: ["user"],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: response.status }
    );
  }

  const data = await response.json();
  const token = data.jwt_access_token;

  const isSecure = process.env.NODE_ENV === "production";
  const expires = new Date(Date.now() + ONE_DAY_SECONDS * 1000);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    expires,
  });

  // Client-readable cookie so AuthProvider can skip requests when token is still valid
  cookieStore.set("auth_expires", expires.toISOString(), {
    httpOnly: false,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return NextResponse.json({ authenticated: true });
}
