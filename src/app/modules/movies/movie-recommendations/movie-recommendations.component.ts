import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './movie-recommendations.component.html',
  styleUrls: ['./movie-recommendations.component.scss']
})
export class MovieRecommendationsComponent implements OnInit, OnChanges {
  @Input() movieId!: number;
  
  recommendations: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recargar recomendaciones cuando cambia el ID de la película
    if (changes['movieId'] && !changes['movieId'].firstChange) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    if (!this.movieId) {
      this.errorMessage = 'No se pudo cargar las recomendaciones: ID de película no válido';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getMovieRecommendations(this.movieId).subscribe({
      next: (data) => {
        this.recommendations = data.results.slice(0, 10); // Limitamos a 10 recomendaciones
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las recomendaciones. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error loading recommendations:', error);
      }
    });
  }

  navigateToMovie(movieId: number): void {
    // Evitamos la navegación si es la misma película
    if (movieId === this.movieId) {
      return;
    }
    
    // Navegamos a la página de detalles de la película
    this.router.navigate(['/movies', movieId]).then(() => {
      this.scrollService.scrollToTop();
    });
  }
}
