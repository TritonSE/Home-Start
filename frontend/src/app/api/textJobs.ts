import { handleAPIError, post } from "./requests";

import type { APIResult } from "./requests";

type TextJobRecipient = {
  firstName: string;
  phoneNumber: string;
};

type CreateTextJobRequest = {
  message: string;
  recipients: TextJobRecipient[];
};

type CreateTextJobResponse = {
  jobId: string;
};

export const createTextJob = async (
  req: CreateTextJobRequest,
): Promise<APIResult<CreateTextJobResponse>> => {
  try {
    const response = await post("/api/text-jobs", req);
    const data = (await response.json()) as CreateTextJobResponse;
    return { success: true, data };
  } catch (err) {
    return handleAPIError(err);
  }
};
