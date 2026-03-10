import { NextRequest } from "next/server";

import { proxyBackendRequest } from "../../_shared/backendProxy";

export async function POST(request: NextRequest) {
  return proxyBackendRequest({
    request,
    backendPath: "/api/volunteer/getSelectedVolunteers",
    method: "POST",
    serviceName: "volunteer",
    forwardJsonBody: true,
  });
}
