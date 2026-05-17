type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
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

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TResponse>;
  }
}

export default NetworkService;
