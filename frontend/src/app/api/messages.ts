import { get } from "./requests";

import type { APIResult } from "./requests";

export type MessageReponse = {
  messages: Message[];
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

export type MessageCreationProps = {
  subject: string;
  date: Date;
  type: "text" | "email";
  message: string;
  recipients: string[];
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

function isMessagesResponse(value: unknown): value is MessageReponse {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<MessageReponse>;
  return Array.isArray(c.messages) && c.messages.every((m) => isMessageResponse(m));
}

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
  } catch (_error) {
    return { success: false, error: "An unexpected error occurred" };
  }
};
