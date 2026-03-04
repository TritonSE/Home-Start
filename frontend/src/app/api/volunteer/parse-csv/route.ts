import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }

  const token = request.cookies.get("firebaseAuthToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(`${API_URL}/api/volunteer/parse-csv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
