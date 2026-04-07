export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error(
      "VITE_API_URL is not set."
    );
  }
  return url.replace(/\/$/, "");
}

let getToken: () => string | null = () => null;

export function configureApiClient(options: { getToken: () => string | null }): void {
  getToken = options.getToken;
}

export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T = unknown>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const { skipAuth, ...rest } = init;
  const headers = new Headers(rest.headers);

  const body = rest.body;
  if (body !== undefined && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...rest, headers });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!res.ok) {
    let message = res.statusText || `HTTP ${res.status}`;
    let details: unknown;
    if (isJson) {
      try {
        const errBody = (await res.json()) as { message?: string; details?: unknown };
        if (typeof errBody.message === "string" && errBody.message.trim() !== "") {
          message = errBody.message;
        }
        details = errBody.details;
      } catch {
        /* ignore parse errors */
      }
    }
    throw new ApiError(message, res.status, details);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (isJson) {
    return (await res.json()) as T;
  }

  return (await res.text()) as T;
}

export async function apiJson<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    skipAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, skipAuth } = options;
  return apiFetch<T>(path, {
    method,
    skipAuth,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}
