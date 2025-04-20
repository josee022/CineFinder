import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MovieResponse, MovieDetails, ImageResponse, KeywordResponse, ReviewResponse, Genre } from './models/movie.model';
import { PersonResponse, PersonDetails } from './models/person.model';
import { TVShow, TVShowResponse, TVShowDetails } from './models/tv.model';
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
    // Obtener la fecha actual
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Usar el endpoint discover con filtro de fecha para asegurar que solo muestre películas futuras
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&page=${page}&region=${this.region}&sort_by=release_date.asc&release_date.gte=${formattedDate}&with_release_type=3|2`
    ).pipe(
      map(response => {
        // Filtrar adicionalmente para asegurarnos de que solo incluya películas con fecha de estreno futura
        const filteredResults = response.results.filter(movie => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          return releaseDate > today;
        });
        
        // Devolver la respuesta con los resultados filtrados
        return {
          ...response,
          results: filteredResults
        };
      })
    );
  }
  
  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=${this.language}&page=${page}&region=${this.region}`
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

  getGenres(): Observable<Genre[]> {
    return this.http.get<{genres: Genre[]}>(`${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=${this.language}`)
      .pipe(
        map((response: {genres: Genre[]}) => response.genres)
      );
  }

  discoverMovies(filters: MovieFilters, page: number = 1): Observable<MovieResponse> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', this.language)
      .set('page', page.toString())
      .set('region', this.region);
    
    // Añadir filtros a los parámetros
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
      }
    }
    
    if (filters.with_keywords && filters.with_keywords.length > 0) {
      params = params.set('with_keywords', filters.with_keywords.join(','));
    }
    
    return this.http.get<MovieResponse>(`${this.baseUrl}/discover/movie`, { params });
  }

  getMovieWatchProviders(movieId: number): Observable<WatchProviderResponse> {
    return this.http.get<WatchProviderResponse>(
      `${this.baseUrl}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
    );
  }

  getWatchProvidersList(): Observable<WatchProvidersListResponse> {
    return this.http.get<WatchProvidersListResponse>(
      `${this.baseUrl}/watch/providers/movie?api_key=${this.apiKey}&language=${this.language}&watch_region=${this.region}`
    );
  }

  // Métodos para actores/personas
  getPopularPeople(page: number = 1): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(
      `${this.baseUrl}/person/popular?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  searchPeople(query: string, page: number = 1): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(
      `${this.baseUrl}/search/person?api_key=${this.apiKey}&language=${this.language}&query=${query}&page=${page}&include_adult=false`
    );
  }

  getPersonDetails(personId: number): Observable<PersonDetails> {
    return this.http.get<PersonDetails>(
      `${this.baseUrl}/person/${personId}?api_key=${this.apiKey}&language=${this.language}&append_to_response=movie_credits,tv_credits,combined_credits,images,external_ids`
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

  // Obtener detalles de una colección
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

  // Métodos para series de TV
  getTVShowDetail(id: number): Observable<TVShowDetails> {
    return this.http.get<TVShowDetails>(
      `${this.baseUrl}/tv/${id}?api_key=${this.apiKey}&language=${this.language}&append_to_response=credits,videos,similar,recommendations,images,keywords,watch/providers`
    );
  }

  searchTVShows(query: string, page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/search/tv?api_key=${this.apiKey}&language=${this.language}&query=${query}&page=${page}&include_adult=false&region=${this.region}`
    );
  }

  getPopularTVShows(page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getTopRatedTVShows(page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/top_rated?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getOnTheAirTVShows(page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/on_the_air?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getAiringTodayTVShows(page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/airing_today?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getTVShowRecommendations(tvId: number, page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/${tvId}/recommendations?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getTVShowSimilar(tvId: number, page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/tv/${tvId}/similar?api_key=${this.apiKey}&language=${this.language}&page=${page}`
    );
  }

  getTVShowsByGenre(genreId: number, page: number = 1): Observable<TVShowResponse> {
    return this.http.get<TVShowResponse>(
      `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&language=${this.language}&with_genres=${genreId}&page=${page}`
    );
  }

  getTVGenres(): Observable<Genre[]> {
    return this.http.get<{genres: Genre[]}>(`${this.baseUrl}/genre/tv/list?api_key=${this.apiKey}&language=${this.language}`)
      .pipe(
        map((response: {genres: Genre[]}) => response.genres)
      );
  }

  getTVShowWatchProviders(tvId: number): Observable<WatchProviderResponse> {
    return this.http.get<WatchProviderResponse>(
      `${this.baseUrl}/tv/${tvId}/watch/providers?api_key=${this.apiKey}`
    );
  }

  getTVWatchProvidersList(): Observable<WatchProvidersListResponse> {
    return this.http.get<WatchProvidersListResponse>(
      `${this.baseUrl}/watch/providers/tv?api_key=${this.apiKey}&language=${this.language}&watch_region=${this.region}`
    );
  }

  discoverTVShows(filters: MovieFilters, page: number = 1): Observable<TVShowResponse> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', this.language)
      .set('page', page.toString());
    
    // Añadir filtros a los parámetros
    if (filters.year) {
      params = params.set('first_air_date_year', filters.year.toString());
    }
    
    if (filters.genres && filters.genres.length > 0) {
      params = params.set('with_genres', filters.genres.join(','));
    }
    
    if (filters.sortBy) {
      // Adaptar los sort_by de películas a series si es necesario
      let sortBy = filters.sortBy;
      if (sortBy === 'release_date.desc') sortBy = 'first_air_date.desc';
      if (sortBy === 'release_date.asc') sortBy = 'first_air_date.asc';
      params = params.set('sort_by', sortBy);
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
      params = params.set('first_air_date.gte', filters.releaseDateGte);
    }
    
    if (filters.releaseDateLte) {
      params = params.set('first_air_date.lte', filters.releaseDateLte);
    }
    
    if (filters.withWatchProviders && filters.withWatchProviders.length > 0) {
      params = params.set('with_watch_providers', filters.withWatchProviders.join('|'));
      
      if (filters.watchRegion) {
        params = params.set('watch_region', filters.watchRegion);
      }
    }
    
    if (filters.with_keywords && filters.with_keywords.length > 0) {
      params = params.set('with_keywords', filters.with_keywords.join(','));
    }
    
    return this.http.get<TVShowResponse>(`${this.baseUrl}/discover/tv`, { params });
  }
}
