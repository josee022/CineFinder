import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieResponse, MovieDetails } from './models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiKey = 'fb1f8d38ff143988203db799e28f1cc7';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getTrendingMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}`);
  }

  getMovieDetail(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=credits,videos,similar,recommendations`);
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`
    );
  }

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`
    );
  }

  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&page=${page}`
    );
  }

  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&page=${page}`
    );
  }

  getMovieRecommendations(movieId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/${movieId}/recommendations?api_key=${this.apiKey}&page=${page}`
    );
  }

  getMovieSimilar(movieId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/${movieId}/similar?api_key=${this.apiKey}&page=${page}`
    );
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&page=${page}`
    );
  }

  getGenres(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
    );
  }
}
