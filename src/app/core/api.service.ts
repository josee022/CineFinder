import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiKey = 'fb1f8d38ff143988203db799e28f1cc7';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getTrendingMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`);
  }

  getMovieDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=credits,videos`);
  }
}
