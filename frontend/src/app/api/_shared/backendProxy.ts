import { NextRequest, NextResponse } from "next/server";

type ProxyMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ProxyOptions = {
  request: NextRequest;
  backendPath: string;
  method: ProxyMethod;
  serviceName: string;
  forwardJsonBody?: boolean;
};

export async function proxyBackendRequest({
  request,
  backendPath,
  method,
  serviceName,
  forwardJsonBody = false,
}: ProxyOptions) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }

  const token = request.cookies.get("firebaseAuthToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authkkenticated" }, { status: 401 });
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    let body: string | undefined;
    if (forwardJsonBody) {
      const jsonBody = await request.json();
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(jsonBody);
    }
    const response = await fetch(`${API_URL}${backendPath}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: `Unable to reach backend ${serviceName} service` },
      { status: 502 },
    );
  }
}
