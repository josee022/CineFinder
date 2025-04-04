import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Added MatProgressSpinnerModule
import { ApiService } from '../../../core/api.service';
import { MovieDetails } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule // Added MatProgressSpinnerModule
  ],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie: MovieDetails | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const movieId = params.get('id');
      if (movieId) {
        this.loadMovieDetails(+movieId);
      }
    });
  }

  loadMovieDetails(id: number): void {
    this.isLoading = true;
    this.apiService.getMovieDetails(id).subscribe({
      next: (data) => {
        this.movie = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load movie details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading movie details:', error);
      }
    });
  }

  getBackdropUrl(): string {
    return this.movie?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${this.movie.backdrop_path}`
      : '';
  }

  getPosterUrl(): string {
    return this.movie?.poster_path 
      ? `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
      : '';
  }
}
