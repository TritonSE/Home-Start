import { NextRequest } from "next/server";

import { proxyBackendRequest } from "../_shared/backendProxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest({
    request,
    backendPath: "/api/volunteer",
    method: "GET",
    serviceName: "volunteer",
  });
}
