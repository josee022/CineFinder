import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieResponse, MovieDetails, ImageResponse, KeywordResponse, ReviewResponse } from './models/movie.model';
import { 
  MovieFilters, 
  WatchProviderResponse, 
  WatchProvidersListResponse,
  PersonSearchResponse,
  CountryResponse,
  LanguageResponse
} from './models/filters.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiKey = 'fb1f8d38ff143988203db799e28f1cc7';
  private baseUrl = 'https://api.themoviedb.org/3';
  private language = 'es-ES';
  private region = 'ES';

  constructor(private http: HttpClient) {}

  getTrendingMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}&language=${this.language}`
    );
  }

  getMovieDetail(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=${this.language}&append_to_response=credits,videos,similar,recommendations,images,keywords,reviews,watch/providers,release_dates`
    );
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=${this.language}&query=${query}&page=${page}&include_adult=false&region=${this.region}`
    );
  }

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${this.language}&page=${page}&region=${this.region}`
    );
  }

  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=${this.language}&page=${page}&region=${this.region}`
    );
  }

  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&language=${this.language}&page=${page}&region=${this.region}`
    );
  }

  getMovieRecommendations(movieId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/${movieId}/recommendations?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getMovieSimilar(movieId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/${movieId}/similar?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&with_genres=${genreId}&page=${page}&region=${this.region}`
    );
  }

  getGenres(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=${this.language}`
    );
  }

  discoverMovies(filters: MovieFilters, page: number = 1): Observable<MovieResponse> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', this.language)
      .set('page', page.toString())
      .set('region', this.region);
    
    if (filters.query) {
      params = params.set('query', filters.query);
    }
    
    if (filters.year) {
      params = params.set('primary_release_year', filters.year.toString());
    }
    
    if (filters.genres && filters.genres.length > 0) {
      params = params.set('with_genres', filters.genres.join(','));
    }
    
    if (filters.sortBy) {
      params = params.set('sort_by', filters.sortBy);
    }
    
    if (filters.includeAdult !== undefined) {
      params = params.set('include_adult', filters.includeAdult.toString());
    }
    
    if (filters.withCast) {
      params = params.set('with_cast', filters.withCast);
    }
    
    if (filters.withCrew) {
      params = params.set('with_crew', filters.withCrew);
    }
    
    if (filters.voteAverageGte) {
      params = params.set('vote_average.gte', filters.voteAverageGte.toString());
    }
    
    if (filters.releaseDateGte) {
      params = params.set('release_date.gte', filters.releaseDateGte);
    }
    
    if (filters.releaseDateLte) {
      params = params.set('release_date.lte', filters.releaseDateLte);
    }
    
    if (filters.withWatchProviders && filters.withWatchProviders.length > 0) {
      params = params.set('with_watch_providers', filters.withWatchProviders.join('|'));
      
      if (filters.watchRegion) {
        params = params.set('watch_region', filters.watchRegion);
      } else {
        params = params.set('watch_region', this.region);
      }
    }
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/discover/movie`, { params });
  }

  getWatchProviders(movieId: number): Observable<WatchProviderResponse> {
    return this.http.get<WatchProviderResponse>(
      `${this.baseUrl}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
    );
  }

  getWatchProvidersList(): Observable<WatchProvidersListResponse> {
    return this.http.get<WatchProvidersListResponse>(
      `${this.baseUrl}/watch/providers/movie?api_key=${this.apiKey}&language=${this.language}&watch_region=${this.region}`
    );
  }

  getMoviesByWatchProvider(providerId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&with_watch_providers=${providerId}&watch_region=${this.region}&page=${page}`
    );
  }

  searchPerson(query: string, page: number = 1): Observable<PersonSearchResponse> {
    return this.http.get<PersonSearchResponse>(
      `${this.baseUrl}/search/person?api_key=${this.apiKey}&language=${this.language}&query=${query}&page=${page}&include_adult=false`
    );
  }

  getCountries(): Observable<CountryResponse[]> {
    return this.http.get<CountryResponse[]>(
      `${this.baseUrl}/configuration/countries?api_key=${this.apiKey}`
    );
  }

  getLanguages(): Observable<LanguageResponse[]> {
    return this.http.get<LanguageResponse[]>(
      `${this.baseUrl}/configuration/languages?api_key=${this.apiKey}`
    );
  }

  getUpcomingReleases(startDate: string, endDate: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=primary_release_date.asc&page=${page}&region=${this.region}`
    );
  }

  getMovieImages(movieId: number): Observable<ImageResponse> {
    return this.http.get<ImageResponse>(
      `${this.baseUrl}/movie/${movieId}/images?api_key=${this.apiKey}`
    );
  }

  getMovieKeywords(movieId: number): Observable<KeywordResponse> {
    return this.http.get<KeywordResponse>(
      `${this.baseUrl}/movie/${movieId}/keywords?api_key=${this.apiKey}`
    );
  }

  getMovieReviews(movieId: number, page: number = 1): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(
      `${this.baseUrl}/movie/${movieId}/reviews?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getCollection(collectionId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/collection/${collectionId}?api_key=${this.apiKey}&language=${this.language}`
    );
  }

  setRegion(region: string): void {
    this.region = region;
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  getCurrentRegion(): string {
    return this.region;
  }

  getCurrentLanguage(): string {
    return this.language;
  }
}
