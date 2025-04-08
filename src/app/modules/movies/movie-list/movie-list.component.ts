import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Movie } from '../../../core/models/movie.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  isLoading = true;
  errorMessage = '';
  
  @ViewChild('movieContainer', { static: false }) movieContainer!: ElementRef;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrendingMovies();
  }

  loadTrendingMovies(): void {
    this.isLoading = true;
    this.apiService.getTrendingMovies().subscribe({
      next: (data) => {
        this.movies = data.results;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load movies. Please try again later.';
        this.isLoading = false;
        console.error('Error loading movies:', error);
      }
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  trackMovieById(index: number, movie: Movie): number {
    return movie.id;
  }
}
