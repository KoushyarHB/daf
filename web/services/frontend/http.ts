import axios, { type AxiosError } from "axios";

/** Browser HTTP client for `/api/*` routes. Server code must not import this module. */
export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

export type ApiErrorBody = { error?: string };

export function getApiErrorMessage(
  error: unknown,
  fallback = "Request failed",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (typeof data?.error === "string") return data.error;
    if (error.response) return `${fallback} (${error.response.status})`;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const { data } = await api.get<T>(url, { signal });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<T>(url, body);
  return data;
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const { data } = await api.delete<T>(url);
  return data;
}

export function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof DOMException && error.name === "AbortError")
  );
}

export type { AxiosError };
