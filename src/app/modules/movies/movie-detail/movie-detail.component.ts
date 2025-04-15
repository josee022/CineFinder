import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd, RouterModule } from '@angular/router';
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
import { WatchProvidersComponent } from '../watch-providers/watch-providers.component';
import { MovieImagesComponent } from '../movie-images/movie-images.component';
import { MovieKeywordsComponent } from '../movie-keywords/movie-keywords.component';
import { MovieReviewsComponent } from '../movie-reviews/movie-reviews.component';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MovieRecommendationsComponent,
    WatchProvidersComponent,
    MovieImagesComponent,
    MovieKeywordsComponent,
    MovieReviewsComponent,
    SafeUrlPipe,
    TranslatePipe
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
      if (id && !isNaN(+id) && +id > 0 && +id !== this.movieId) {
        this.movieId = +id;
        this.loadMovieDetails(this.movieId);
      } else {
        // Redirigir a la página de inicio si el ID no es válido
        this.router.navigate(['/home']);
        this.errorMessage = 'ID de película no válido.';
        this.isLoading = false;
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
    if (id && !isNaN(+id) && +id > 0) {
      this.movieId = +id;
      this.loadMovieDetails(this.movieId);
    } else {
      // Redirigir a la página de inicio si el ID no es válido
      this.router.navigate(['/home']);
      this.errorMessage = 'ID de película no válido.';
      this.isLoading = false;
    }
  }

  loadMovieDetails(id: number): void {
    if (!id || isNaN(id) || id <= 0) {
      this.errorMessage = 'ID de película no válido.';
      this.isLoading = false;
      return;
    }
    
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
