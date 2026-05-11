import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!API_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }

  const token = request.cookies.get("firebaseAuthToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const requestBody: unknown = await request.json();
    const response = await fetch(`${API_URL}/api/volunteer/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload: unknown = contentType.includes("application/json")
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
