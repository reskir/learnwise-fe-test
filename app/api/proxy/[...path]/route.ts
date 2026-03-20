import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.BASE_API_URL || "https://api.sandbox.learnwise.dev";
const ASSISTANT_ID = process.env.ASSISTANT_ID;

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {

  if (typeof ASSISTANT_ID !== "string") {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: ASSISTANT_ID is missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { path } = await params;
  const target = new URL(`/${path.join("/")}`, BASE_API_URL);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    "X-assistant-id": ASSISTANT_ID,
    Authorization: `Bearer ${token}`,
  };

  // Forward content-type for POST/PUT/PATCH
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = request.body;
    // @ts-expect-error -- Node fetch supports duplex for streaming request bodies
    fetchOptions.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, fetchOptions);
    console.log(`[proxy] ${request.method} ${target} -> ${upstream.status}`);
  } catch (err) {
    console.log(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[proxy] ${request.method} ${target} failed:`, message);
    return new Response(
      JSON.stringify({ error: "Upstream request failed", detail: message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Forward upstream status and body as-is (preserves streaming for qa-stream)
  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") || "application/json",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
