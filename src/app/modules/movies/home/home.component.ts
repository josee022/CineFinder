import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../core/api.service';
import { Movie } from '../../../core/models/movie.model';
import { MovieListComponent } from '../movie-list/movie-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MovieListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  
  isLoading = true;
  errorMessage = '';
  
  currentSlide = 0;
  autoplayInterval: any;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedMovies();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  loadFeaturedMovies(): void {
    this.isLoading = true;
    this.apiService.getTrendingMovies().subscribe({
      next: (data) => {
        this.featuredMovies = data.results.slice(0, 5);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load featured movies. Please try again later.';
        this.isLoading = false;
        console.error('Error loading featured movies:', error);
      }
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.featuredMovies.length;
    this.resetAutoplay();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.featuredMovies.length) % this.featuredMovies.length;
    this.resetAutoplay();
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoplay();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  getBackdropUrl(movie: Movie): string {
    return movie?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : '';
  }
}
