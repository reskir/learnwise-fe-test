import { NextResponse } from "next/server";

export async function POST() {

  if (!process.env.ASSISTANT_ID) {
    return NextResponse.json(
      { error: "Server misconfiguration: ASSISTANT_ID is missing" },
      { status: 500 }
    );
  }

  const url = new URL('/chat/sign-in/injector', process.env.BASE_API_URL || 'https://api.sandbox.learnwise.dev');

  const response = await fetch(
   url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-assistant-id": process.env.ASSISTANT_ID,
      },
      body: JSON.stringify({
        name: "Test User",
        roles: ["user"],
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
