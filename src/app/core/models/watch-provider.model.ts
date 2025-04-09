export interface WatchProviderResponse {
  id: number;
  results: {
    [countryCode: string]: CountryProviders;
  };
}

export interface CountryProviders {
  link: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  free?: Provider[];
  ads?: Provider[];
}

export interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderListResponse {
  results: Provider[];
}
