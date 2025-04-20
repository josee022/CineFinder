export interface PersonResponse {
  page: number;
  results: Person[];
  total_results: number;
  total_pages: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for?: Movie[];
  popularity: number;
  gender: number;
  adult: boolean;
}

export interface PersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number;
  known_for_department: string;
  popularity: number;
  adult: boolean;
  homepage: string | null;
  also_known_as: string[];
  images?: {
    profiles: Image[];
  };
  combined_credits?: {
    cast: MovieCredit[];
    crew: MovieCredit[];
  };
  movie_credits?: {
    cast: MovieCredit[];
    crew: MovieCredit[];
  };
  tv_credits?: {
    cast: TVCredit[];
    crew: TVCredit[];
  };
  external_ids?: {
    imdb_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
}

export interface Image {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
}

export interface MovieCredit {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  character?: string;
  credit_id: string;
  order?: number;
  job?: string;
  department?: string;
}

export interface TVCredit {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  character?: string;
  credit_id: string;
  episode_count?: number;
  job?: string;
  department?: string;
}

// Interfaz auxiliar para compatibilidad con componentes existentes
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  adult: boolean;
  genre_ids: number[];
}
