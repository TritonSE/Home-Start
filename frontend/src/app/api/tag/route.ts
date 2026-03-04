import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }

  const token = request.cookies.get("firebaseAuthToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/api/tag`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach backend volunteer service" },
      { status: 502 },
    );
  }
}
