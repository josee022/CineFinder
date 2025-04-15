export interface MovieFilters {
  query?: string;
  year?: number;
  genres?: number[];
  sortBy?: SortOption;
  includeAdult?: boolean;
  withCast?: string;
  withCrew?: string;
  voteAverageGte?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  withWatchProviders?: number[];
  watchRegion?: string;
  with_keywords?: number[];
}

export type SortOption = 
  'popularity.desc' | 
  'popularity.asc' | 
  'vote_average.desc' | 
  'vote_average.asc' | 
  'release_date.desc' | 
  'release_date.asc' | 
  'revenue.desc' | 
  'revenue.asc';

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderResponse {
  results: {
    [key: string]: {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    }
  }
}

export interface WatchProvidersListResponse {
  results: WatchProvider[];
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface PersonSearchResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

export interface CountryResponse {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

export interface LanguageResponse {
  iso_639_1: string;
  english_name: string;
  name: string;
}
