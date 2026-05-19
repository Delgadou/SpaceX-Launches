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
