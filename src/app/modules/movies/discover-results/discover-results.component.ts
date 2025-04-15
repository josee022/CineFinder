import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { ApiService } from '../../../core/api.service';
import { FilterService } from '../../../core/services/filter.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { MovieFilters } from '../../../core/models/filters.model';
import { Movie, Genre } from '../../../core/models/movie.model';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-discover-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './discover-results.component.html',
  styleUrls: ['./discover-results.component.scss']
})
export class DiscoverResultsComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Paginación
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  
  // Filtros aplicados
  currentFilters: MovieFilters = {};
  
  // Para mostrar nombres de géneros
  genres: Genre[] = [];
  
  // Para gestionar suscripciones
  private destroy$ = new Subject<void>();
  
  constructor(
    private apiService: ApiService,
    private filterService: FilterService,
    private scrollService: ScrollService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Cargar géneros para poder mostrar sus nombres
    this.loadGenres();
    
    // Suscribirse a cambios en la ruta (paginación)
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.loadMovies();
    });
    
    // Suscribirse a cambios en los filtros
    this.filterService.getFilters().pipe(
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.currentFilters = filters;
      // Solo recargar si ya se han cargado películas antes (evita doble carga inicial)
      if (!this.isLoading && this.movies.length > 0) {
        this.loadMovies();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadGenres(): void {
    this.apiService.getGenres().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.genres = response;
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
      }
    });
  }
  
  loadMovies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.scrollService.scrollToTop();
    
    this.apiService.discoverMovies(this.currentFilters, this.currentPage).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar películas. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error cargando películas:', error);
      }
    });
  }
  
  onPageChange(pageNumber: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge'
    });
  }
  
  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
  
  editFilters(): void {
    this.router.navigate(['/movies/filters']);
  }
  
  // Obtener nombres de géneros a partir de IDs
  getGenreNames(genreIds: number[]): string[] {
    if (!this.genres.length || !genreIds) return [];
    
    return genreIds
      .map(id => this.genres.find(genre => genre.id === id)?.name)
      .filter(name => name !== undefined) as string[];
  }
  
  // Formatear fecha
  formatReleaseDate(dateStr: string): string {
    if (!dateStr) return 'Fecha desconocida';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Obtener URL de póster
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) return 'assets/images/no-poster.png';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }
  
  // Obtener descripción de los filtros aplicados
  getFilterDescription(): string {
    const parts = [];
    
    if (this.currentFilters.query) {
      parts.push(`"${this.currentFilters.query}"`);
    }
    
    if (this.currentFilters.year) {
      parts.push(`del año ${this.currentFilters.year}`);
    }
    
    if (this.currentFilters.genres && this.currentFilters.genres.length > 0) {
      const genreNames = this.getGenreNames(this.currentFilters.genres);
      if (genreNames.length === 1) {
        parts.push(`de género ${genreNames[0]}`);
      } else if (genreNames.length > 1) {
        parts.push(`de géneros ${genreNames.slice(0, -1).join(', ')} y ${genreNames[genreNames.length - 1]}`);
      }
    }
    
    if (parts.length === 0) {
      return 'Todas las películas';
    }
    
    return parts.join(' ');
  }
  
  // Contar número de filtros aplicados
  countAppliedFilters(): number {
    let count = 0;
    
    if (this.currentFilters.query) count++;
    if (this.currentFilters.year) count++;
    if (this.currentFilters.genres && this.currentFilters.genres.length > 0) count++;
    if (this.currentFilters.withCast) count++;
    if (this.currentFilters.withCrew) count++;
    if (this.currentFilters.voteAverageGte && this.currentFilters.voteAverageGte > 0) count++;
    if (this.currentFilters.withWatchProviders && this.currentFilters.withWatchProviders.length > 0) count++;
    
    return count;
  }
  
  // Verificar si hay filtros aplicados
  hasFilters(): boolean {
    return this.countAppliedFilters() > 0;
  }
}
