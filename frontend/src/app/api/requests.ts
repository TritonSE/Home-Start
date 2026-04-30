/**
 * Based on the TSE Fulcrum API client implementation by justinyaodu:
 * https://github.com/TritonSE/TSE-Fulcrum/blob/main/frontend/src/api.ts
 */

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase/firebase";

/**
 * A custom type defining which HTTP methods we will handle in this file
 */
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * The first part of the backend API URL, which we will automatically prepend to
 * every request. This means in the rest of our code, we can write "/api/foo"
 * instead of "http://localhost:3001/api/foo".
 *
 * See https://vitejs.dev/guide/env-and-mode for more info about env variables
 * in Vite projects.
 */
// const API_BASE_URL = import.env.VITE_API_BASE_URL;
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(
  /\/+$/,
  "",
);

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (API_BASE_URL.endsWith("/api")) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}/api${normalizedPath}`;
}

// Gets firebase auth token
async function waitForAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        user.getIdToken().then(resolve).catch(reject);
      } else {
        reject(new Error("Not authenticated"));
      }
    });
  });
}

/**
 * A wrapper around the built-in `fetch()` function that abstracts away some of
 * the low-level details so we can focus on the important parts of each request.
 * See https://developer.mozilla.org/en-US/docs/Web/API/fetch for information
 * about the Fetch API.
 *
 * @param method The HTTP method to use
 * @param url The URL to request
 * @param body The body of the request, or undefined if there is none
 * @param headers The headers of the request
 * @returns The Response object returned by `fetch()
 */
async function fetchRequest(
  method: Method,
  url: string,
  body: unknown,
  headers: Record<string, string>,
  options: RequestInit = {},
): Promise<Response> {
  const hasBody = body !== undefined;

  // Grab token for auth headers
  const token = await waitForAuth();

  // Add auth header
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
    ...options,
  });

  return response;
}

/**
 * Throws an error if the given response's status code indicates an error
 * occurred, else does nothing.
 *
 * @param response A response returned by `fetch()` or `fetchRequest()`
 * @throws An error if the response was not successful (200-299) or a redirect
 * (300-399)
 */
async function assertOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  let message = `${String(response.status)} ${response.statusText}`;

  try {
    const text = await response.text();
    if (text) {
      message += `: ${text}`;
    }
  } catch (e) {
    console.info(e);
  }

  throw new Error(message);
}

/**
 * Sends a GET request to the provided API URL.
 *
 * @param url The URL to request
 * @param headers The headers of the request (optional)
 * @returns The Response object returned by `fetch()`
 */
export async function get(url: string, options: RequestInit = {}): Promise<Response> {
  const { headers = {}, ...opts } = options;

  // GET requests do not have a body
  const response = await fetchRequest(
    "GET",
    buildApiUrl(url),
    undefined,
    headers as Record<string, string>,
    opts,
  );
  await assertOk(response);
  return response;
}

/**
 * Sends a POST request to the provided API URL.
 *
 * @param url The URL to request
 * @param body The body of the request, or undefined if there is none
 * @param headers The headers of the request (optional)
 * @returns The Response object returned by `fetch()`
 */
export async function post(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const { headers = {}, ...opts } = options;

  const response = await fetchRequest(
    "POST",
    buildApiUrl(url),
    body,
    headers as Record<string, string>,
    opts,
  );
  await assertOk(response);
  return response;
}

/**
 * Sends a PUT request to the provided API URL.
 *
 * @param url The URL to request
 * @param body The body of the request, or undefined if there is none
 * @param headers The headers of the request (optional)
 * @returns The Response object returned by `fetch()`
 */
export async function put(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const { headers = {}, ...opts } = options;

  const response = await fetchRequest(
    "PUT",
    buildApiUrl(url),
    body,
    headers as Record<string, string>,
    opts,
  );
  await assertOk(response);
  return response;
}

/**
 * Sends a PATCH request to the provided API URL.
 *
 * @param url The URL to request
 * @param body The body of the request, or undefined if there is none
 * @param headers The headers of the request (optional)
 * @returns The Response object returned by `fetch()`
 */
export async function patch(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const { headers = {}, ...opts } = options;

  const response = await fetchRequest(
    "PATCH",
    buildApiUrl(url),
    body,
    headers as Record<string, string>,
    opts,
  );
  await assertOk(response);
  return response;
}

/**
 * Sends a DELETE request to the provided API URL.
 *
 * @param url The URL to request
 * @param body The body of the request, or undefined if there is none
 * @param headers The headers of the request (optional)
 * @returns The Response object returned by `fetch()`
 */
export async function del(
  url: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<Response> {
  const { headers = {}, ...opts } = options;

  const response = await fetchRequest(
    "DELETE",
    buildApiUrl(url),
    body,
    headers as Record<string, string>,
    opts,
  );
  await assertOk(response);
  return response;
}

export type APIData<T> = { success: true; data: T };
export type APIError = { success: false; error: string };
/**
 * Utility type for the result of an API request. API client functions should
 * always return an object of this type (without throwing an exception if
 * something goes wrong). This allows users of the functions to perform easier
 * error checking without excessive try-catch statements, making use of
 * TypeScript's type narrowing feature. Specifically, by checking whether the
 * `success` field is true or false, you'll know whether you can access the
 * `data` field with the actual API response or the `error` field with an error
 * message.
 *
 * For example, assume we have some API function with the type definition
 * `doSomeRequest: (parameters: SomeParameters) => Promise<APIResult<SomeData>>`.
 * Then we could use it in a frontend component as follows:
 * ```
 * doSomeRequest(parameters).then((result: APIResult<SomeData>) => {
 *   if (result.success) {
 *     console.log(result.data); // do something with the data, which is of type SomeData
 *   } else {
 *     console.error(result.error); // do something to inform the user of the error
 *   }
 * })
 * ```
 *
 * See `createTask` in `src/api/tasks` and its use in `src/components/TaskForm`
 * for a more concrete example, and see
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html for more info
 * about type narrowing.
 */
export type APIResult<T> = APIData<T> | APIError;

/**
 * Helper function for API client functions to handle errors consistently.
 * Recommended usage is in a `catch` block--see `createTask` in `src/api/tasks`
 * for an example.
 *
 * @param error An error thrown by a lower-level API function
 * @returns An `APIError` object with a message from the given error
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  } else if (typeof error === "string") {
    return { success: false, error };
  }
  return { success: false, error: `Unknown error: ${String(error)}` };
}
