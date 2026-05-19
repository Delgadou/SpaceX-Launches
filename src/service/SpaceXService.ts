import { Launch } from '@/models/Launch';
import NetworkService, { isNetworkError, NetworkError } from './NetworkService';

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: NetworkError };

interface QueryResponse {
  docs: Launch[];
  totalDocs: number;
}

function toNetworkError(error: unknown): NetworkError {
  if (isNetworkError(error)) return error;
  return { kind: 'unknown', error: error instanceof Error ? error : new Error(String(error)) };
}

class SpaceXService {
  private readonly baseURL = 'https://api.spacexdata.com/v5/';
  private readonly networkService: NetworkService;

  constructor(networkService: NetworkService = NetworkService.shared()) {
    this.networkService = networkService;
  }

  async fetchLaunch(id: string): Promise<Result<Launch>> {
    try {
      const response = await this.networkService.post<object, QueryResponse>(
        this.baseURL + 'launches/query',
        {
          query: { _id: id },
          options: { populate: ['crew.crew'], limit: 1 },
        }
      );
      const launch = response.docs[0];
      if (!launch) return { success: false, error: { kind: 'noData' } };
      return { success: true, data: launch };
    } catch (error) {
      return { success: false, error: toNetworkError(error) };
    }
  }

  async fetchUpcomingLaunches(): Promise<Result<Launch[]>> {
    try {
      const response = await this.networkService.post<object, QueryResponse>(
        this.baseURL + 'launches/query',
        {
          query: { upcoming: true },
          options: {
            populate: ['crew.crew'],
            sort: { date_unix: 1 },
            pagination: false,
          },
        }
      );
      return { success: true, data: response.docs };
    } catch (error) {
      return { success: false, error: toNetworkError(error) };
    }
  }

  async fetchLaunches(): Promise<Result<Launch[]>> {
    try {
      const response = await this.networkService.post<object, QueryResponse>(
        this.baseURL + 'launches/query',
        {
          query: { upcoming: false },
          options: {
            populate: ['crew.crew'],
            sort: { date_unix: -1 },
            pagination: false,
          },
        }
      );
      return { success: true, data: response.docs };
    } catch (error) {
      return { success: false, error: toNetworkError(error) };
    }
  }
}

export default SpaceXService;
