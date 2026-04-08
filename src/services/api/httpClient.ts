import { shopEnv } from '../../config/env';

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestJsonOptions extends RequestInit {
  timeoutMs?: number;
}

const buildUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${shopEnv.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

export const requestJson = async <T>(path: string, options: RequestJsonOptions = {}): Promise<T> => {
  const { timeoutMs = shopEnv.requestTimeoutMs, headers, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const message =
        typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
          ? body.message
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, body);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La requete a expire. Veuillez reessayer.');
    }

    throw error instanceof Error ? error : new Error('Une erreur reseau est survenue.');
  } finally {
    window.clearTimeout(timeoutId);
  }
};
