import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { MovieDetails } from '../../../core/models/movie.model';
import { MovieRecommendationsComponent } from '../movie-recommendations/movie-recommendations.component';
import { Subscription, filter } from 'rxjs';

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
    MatProgressSpinnerModule,
    MovieRecommendationsComponent
  ],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: MovieDetails | null = null;
  isLoading = true;
  errorMessage = '';
  movieId = 0;
  private routerSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {
    // Cargar los detalles iniciales de la película
    this.loadInitialMovie();
    
    // Suscribirse a cambios de ruta para manejar navegación entre películas
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && +id !== this.movieId) {
        this.movieId = +id;
        this.loadMovieDetails(this.movieId);
      }
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  loadInitialMovie(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = +id;
      this.loadMovieDetails(this.movieId);
    }
  }

  loadMovieDetails(id: number): void {
    this.isLoading = true;
    this.movie = null; // Limpiar datos anteriores
    this.scrollService.scrollToTop(); // Scroll al inicio de la página
    
    this.apiService.getMovieDetail(id).subscribe({
      next: (data: MovieDetails) => {
        this.movie = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al cargar los detalles de la película. Por favor, inténtalo de nuevo más tarde.';
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
