import { APIResult, del, get, handleAPIError, post, put } from "./requests";

export type Template = {
  _id: string;
  title: string;
  message: string;
  type: string;
  subject?: string;
};

export const getTemplate = async (templateId: string): Promise<APIResult<Template>> => {
  try {
    const response = await get(`/api/template/${templateId}`);
    if (response.ok) {
      const template = await response.json();

      return { success: true, data: template };
    } else {
      return { success: false, error: (await response.json()).error };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export const getTemplates = async (): Promise<APIResult<Template[]>> => {
  try {
    const response = await get(`/api/template`);
    if (response.ok) {
      const templates: Template[] = await response.json();

      return { success: true, data: templates };
    } else {
      return { success: false, error: (await response.json()).error };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

type CreateTemplateRequest = {
  title: string;
  message: string;
  type: string;
  subject?: string;
};

export const createTemplate = async (
  templateObj: CreateTemplateRequest,
): Promise<APIResult<Template>> => {
  try {
    const response = await post(`/api/template`, templateObj);
    if (response.ok) {
      const data = (await response.json()) as Template;
      return { success: true, data };
    } else {
      return { success: false, error: (await response.json()).error };
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
      const data = (await response.json()) as Template;
      return { success: true, data };
    } else {
      return { success: false, error: (await response.json()).error };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};

export const deleteTemplate = async (templateId: string): Promise<APIResult<string>> => {
  try {
    const response = await del(`/api/template/${templateId}`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data.message };
    } else {
      return { success: false, error: (await response.json()).error };
    }
  } catch (err) {
    return handleAPIError(err);
  }
};
