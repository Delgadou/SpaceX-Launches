import NetworkService from './NetworkService';

export interface CrewMember {
  id: string;
  name: string;
  agency: string;
  image: string;
}

export interface LaunchCrew {
  crew: CrewMember;
  role: string;
}

export interface LaunchCore {
  core: string;
  reused: boolean;
}

export interface Launch {
  id: string;
  name: string;
  flight_number: number;
  date_utc: string;
  date_unix: number;
  upcoming: boolean;
  success: boolean | null;
  details: string | null;
  rocket: string;
  launchpad: string;
  crew: LaunchCrew[];
  cores: LaunchCore[];
  links: {
    patch: { small: string | null; large: string | null };
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
  };
}

interface QueryResponse {
  docs: Launch[];
  totalDocs: number;
}

export type NetworkError = { message: string };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: NetworkError };

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
      if (!launch) throw new Error('Launch not found');
      return { success: true, data: launch };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: { message } };
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: { message } };
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: { message } };
    }
  }
}

export default SpaceXService;
