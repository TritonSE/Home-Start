import { del, get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "./requests";
import type { APIErrorBody } from "./types";

export enum TemplateType {
  TEXT = "text",
  EMAIL = "email",
}

export type Template = {
  _id: string;
  title: string;
  message: string;
  type: TemplateType;
  subject?: string;
};

type TemplateResponse = {
  _id: string;
  title: string;
  message: string;
  type: string;
  subject?: string;
};

function isTemplateResponse(value: unknown): value is TemplateResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TemplateResponse>;
  return (
    typeof candidate._id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.type === "string"
  );
}

function toTemplate(value: TemplateResponse): Template {
  return {
    _id: value._id,
    title: value.title,
    message: value.message,
    type: value.type as TemplateType,
    subject: value.subject,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    return "Request failed";
  }

  const errorBody = body as APIErrorBody;
  if (typeof errorBody.error === "string") {
    return errorBody.error;
  }
  if (typeof errorBody.message === "string") {
    return errorBody.message;
  }
  return "Request failed";
}

export const getTemplate = async (templateId: string): Promise<APIResult<Template>> => {
  try {
    const response = await get(`/api/template/${templateId}`);
    if (response.ok) {
      const templateJson: unknown = await response.json();
      if (!isTemplateResponse(templateJson)) {
        return { success: false, error: "Unexpected template response format" };
      }

      return { success: true, data: toTemplate(templateJson) };
    } else {
      return { success: false, error: await readErrorMessage(response) };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export const getTemplates = async (): Promise<APIResult<Template[]>> => {
  try {
    const response = await get(`/api/template`);
    if (response.ok) {
      const templatesJson: unknown = await response.json();
      if (!Array.isArray(templatesJson)) {
        return { success: false, error: "Unexpected templates response format" };
      }

      const templates = templatesJson.filter(isTemplateResponse).map(toTemplate);

      return { success: true, data: templates };
    } else {
      return { success: false, error: await readErrorMessage(response) };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export type CreateTemplateRequest = {
  title: string;
  message: string;
  type: TemplateType;
  subject?: string;
};

export const createTemplate = async (
  templateObj: CreateTemplateRequest,
): Promise<APIResult<Template>> => {
  try {
    const response = await post(`/api/template`, templateObj);
    if (response.ok) {
      const data: unknown = await response.json();
      if (!isTemplateResponse(data)) {
        return { success: false, error: "Unexpected template response format" };
      }

      return { success: true, data: toTemplate(data) };
    } else {
      return { success: false, error: await readErrorMessage(response) };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export const updateTemplate = async (
  templateId: string,
  templateObj: CreateTemplateRequest,
): Promise<APIResult<Template>> => {
  try {
    const response = await put(`/api/template/${templateId}`, templateObj);
    if (response.ok) {
      const data: unknown = await response.json();
      if (!isTemplateResponse(data)) {
        return { success: false, error: "Unexpected template response format" };
      }

      return { success: true, data: toTemplate(data) };
    } else {
      return { success: false, error: await readErrorMessage(response) };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export const deleteTemplate = async (templateId: string): Promise<APIResult<string>> => {
  try {
    const response = await del(`/api/template/${templateId}`);
    if (response.ok) {
      const text = await response.text();
      if (!text) {
        return { success: true, data: "Template deleted successfully" };
      }

      const data: unknown = JSON.parse(text);
      if (!data || typeof data !== "object") {
        return { success: false, error: "Unexpected delete template response format" };
      }

      const message = (data as APIErrorBody).message;
      if (typeof message !== "string") {
        return { success: false, error: "Unexpected delete template response format" };
      }

      return { success: true, data: message };
    } else {
      return { success: false, error: await readErrorMessage(response) };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};
