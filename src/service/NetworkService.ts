type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
}

export type NetworkError =
  | { kind: 'invalidURL' }
  | { kind: 'invalidResponse' }
  | { kind: 'httpError'; statusCode: number }
  | { kind: 'noData' }
  | { kind: 'decodingError'; message: string }
  | { kind: 'unknown'; error: Error };

export function networkErrorDescription(error: NetworkError): string {
  switch (error.kind) {
    case 'invalidURL':
      return 'Invalid URL';
    case 'invalidResponse':
      return 'Invalid response from server';
    case 'httpError':
      return `HTTP error: ${error.statusCode}`;
    case 'noData':
      return 'No data received';
    case 'decodingError':
      return `Decoding failed: ${error.message}`;
    case 'unknown':
      return `Unknown error: ${error.error.message}`;
  }
}

function isNetworkError(value: unknown): value is NetworkError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    typeof (value as { kind: unknown }).kind === 'string'
  );
}

class NetworkService {
  private static instance: NetworkService;

  private constructor() {}

  static shared(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  async get<TResponse>(url: string, headers?: Record<string, string>): Promise<TResponse> {
    return this.request<undefined, TResponse>(url, { method: 'GET', headers });
  }

  async post<TBody, TResponse>(url: string, body: TBody, headers?: Record<string, string>): Promise<TResponse> {
    return this.request<TBody, TResponse>(url, { method: 'POST', body, headers });
  }

  private async request<TBody, TResponse>(
    url: string,
    options: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const { method = 'GET', body, headers = {} } = options;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw { kind: 'unknown', error: error instanceof Error ? error : new Error(String(error)) } as NetworkError;
    }

    if (!response.ok) {
      throw { kind: 'httpError', statusCode: response.status } as NetworkError;
    }

    let text: string;
    try {
      text = await response.text();
    } catch {
      throw { kind: 'invalidResponse' } as NetworkError;
    }

    if (!text) {
      throw { kind: 'noData' } as NetworkError;
    }

    try {
      return JSON.parse(text) as TResponse;
    } catch (error) {
      throw { kind: 'decodingError', message: error instanceof Error ? error.message : 'Parse failed' } as NetworkError;
    }
  }
}

export { isNetworkError };
export default NetworkService;
