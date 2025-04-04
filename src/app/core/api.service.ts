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

  searchMovies(query: string): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`);
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=credits,videos`);
  }
  
  getPopularMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/popular?api_key=${this.apiKey}`);
  }
  
  getTopRatedMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}`);
  }
  
  getUpcomingMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}`);
  }
}
