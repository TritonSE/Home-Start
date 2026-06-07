import { get, handleAPIError, post } from "./requests";

import type { APIResult } from "./requests";

export type MessageResponse = {
  messages: Message[];
};

export type MessagesPageResponse = MessageResponse & {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Recipient = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  created?: string;
  updated?: string;
};

export type Message = {
  _id: string;
  subject: string | null;
  body: string;
  type: "text" | "email";
  recipients: Recipient[];
  status: "pending" | "sent";
  timestamp: string;
};

export type CreateMessageHistoryRequest = {
  recipients: string[];
  type: "text" | "email";
  subject: string | null;
  body: string;
  status?: "sent" | "pending";
};

function isRecipient(value: unknown): value is Recipient {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Recipient>;
  return typeof c._id === "string";
}

function isMessageResponse(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Message>;
  return (
    typeof c._id === "string" &&
    (typeof c.subject === "string" || c.subject === null) &&
    typeof c.body === "string" &&
    (c.type === "text" || c.type === "email") &&
    Array.isArray(c.recipients) &&
    c.recipients.every((r) => isRecipient(r)) &&
    (c.status === "pending" || c.status === "sent") &&
    typeof c.timestamp === "string"
  );
}

function isMessagesResponse(value: unknown): value is MessageResponse {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<MessageResponse>;
  return Array.isArray(c.messages) && c.messages.every((m) => isMessageResponse(m));
}

function isMessagesPageResponse(value: unknown): value is MessagesPageResponse {
  if (!isMessagesResponse(value)) return false;
  const c = value as Partial<MessagesPageResponse>;
  return (
    typeof c.total === "number" &&
    typeof c.page === "number" &&
    typeof c.limit === "number" &&
    typeof c.totalPages === "number"
  );
}

type GetMessagesOptions = {
  page?: number;
  limit?: number;
  type?: "text" | "email";
};

const buildMessagesQuery = ({ page, limit, type }: GetMessagesOptions) => {
  const params = new URLSearchParams();
  if (page !== undefined) params.set("page", String(page));
  if (limit !== undefined) params.set("limit", String(limit));
  if (type !== undefined) params.set("type", type);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getMessages = async (): Promise<APIResult<Message[]>> => {
  try {
    const response = await get("/api/message");
    if (!response.ok) {
      return { success: false, error: await response.text() };
    }

    const responseJson: unknown = await response.json();

    if (!isMessagesResponse(responseJson)) {
      return {
        success: false,
        error: `Unexpected message response format: ${JSON.stringify(responseJson)}`,
      };
    }

    const { messages } = responseJson;
    return { success: true, data: messages };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const getMessagesPage = async (
  options: GetMessagesOptions = {},
): Promise<APIResult<MessagesPageResponse>> => {
  try {
    const response = await get(`/api/message${buildMessagesQuery(options)}`);
    if (!response.ok) {
      return { success: false, error: await response.text() };
    }

    const responseJson: unknown = await response.json();

    if (!isMessagesPageResponse(responseJson)) {
      return {
        success: false,
        error: `Unexpected message response format: ${JSON.stringify(responseJson)}`,
      };
    }

    return { success: true, data: responseJson };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const createMessageHistory = async (
  messageObj: CreateMessageHistoryRequest,
): Promise<APIResult<unknown>> => {
  try {
    const response = await post("/api/message", messageObj);
    const responseJson: unknown = await response.json();

    return { success: true, data: responseJson };
  } catch (err) {
    return handleAPIError(err);
  }
};

export type SendEmailRequest = {
  graphToken: string;
  recipients: Recipient[];
  subject: string;
  message: string;
  sendDate?: string;
};

export const sendEmails = async (emailObj: SendEmailRequest): Promise<APIResult<unknown>> => {
  try {
    const response = await post("/api/messages/send-email", emailObj);
    const responseJson: unknown = await response.json();

    return { success: true, data: responseJson };
  } catch (err) {
    return handleAPIError(err);
  }
};
