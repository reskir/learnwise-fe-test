export class ApiError extends Error {
  status: number;
  errorType: string;
  params: Record<string, string>;

  constructor(
    status: number,
    message: string,
    errorType: string,
    params: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorType = errorType;
    this.params = params;
  }
}

export async function apiClient(path: string, options: RequestInit = {}) {
  const url = `/api/proxy${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    let errorType = "UNKNOWN_ERROR";
    let params: Record<string, string> = {};

    try {
      const body = await response.json();
      if (body.message) errorMessage = body.message;
      if (body.error_type) errorType = body.error_type;
      if (body.params) params = body.params;
    } catch {
      // body wasn't JSON, use default message
    }

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    throw new ApiError(response.status, errorMessage, errorType, params);
  }

  return response;
}

export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiClient(path, options);
  return response.json() as Promise<T>;
}
