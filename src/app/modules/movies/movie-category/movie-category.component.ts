import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { Movie } from '../../../core/models/movie.model';
import { MovieFilters } from '../../../core/models/filters.model';
import { MovieFiltersComponent } from '../movie-filters/movie-filters.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

type CategoryType = 'popular' | 'top_rated' | 'top-rated' | 'upcoming' | 'now_playing' | 'now-playing' | 'discover';

@Component({
  selector: 'app-movie-category',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MovieFiltersComponent,
    TranslatePipe
  ],
  templateUrl: './movie-category.component.html',
  styleUrls: ['./movie-category.component.scss']
})
export class MovieCategoryComponent implements OnInit {
  categoryType: CategoryType = 'popular';
  movies: Movie[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Paginación
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize = 20;
  
  // Filtros
  showFilters = false;
  currentFilters: MovieFilters = {
    sortBy: 'popularity.desc'
  };
  
  categoryTitles: Record<CategoryType, string> = {
    popular: 'Películas Populares',
    top_rated: 'Películas Mejor Valoradas',
    'top-rated': 'Películas Mejor Valoradas',
    upcoming: 'Próximos Estrenos',
    now_playing: 'En Cartelera',
    'now-playing': 'En Cartelera',
    discover: 'Descubrir Películas'
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {
    // Primero intentamos obtener el tipo de categoría de los datos de la ruta
    this.route.data.subscribe(data => {
      if (data['categoryType']) {
        this.categoryType = data['categoryType'] as CategoryType;
        this.loadMovies();
      }
    });
    
    // También manejamos el caso de que el tipo de categoría venga como parámetro de la URL
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.categoryType = params['category'] as CategoryType;
        this.loadMovies();
      }
    });
    
    this.route.queryParams.subscribe(params => {
      const page = Number(params['page']) || 1;
      if (page !== this.currentPage) {
        this.currentPage = page;
        this.loadMovies();
      }
    });
  }

  loadMovies(): void {
    this.isLoading = true;
    this.scrollService.scrollToTop();
    
    if (this.categoryType === 'discover') {
      this.loadMoviesWithFilters();
      return;
    }
    
    let apiCall;
    
    switch (this.categoryType) {
      case 'popular':
        apiCall = this.apiService.getPopularMovies(this.currentPage);
        break;
      case 'top_rated':
      case 'top-rated':
        apiCall = this.apiService.getTopRatedMovies(this.currentPage);
        break;
      case 'upcoming':
        apiCall = this.apiService.getUpcomingMovies(this.currentPage);
        break;
      case 'now_playing':
      case 'now-playing':
        apiCall = this.apiService.getNowPlayingMovies(this.currentPage);
        break;
      default:
        apiCall = this.apiService.getPopularMovies(this.currentPage);
    }
    
    apiCall.subscribe({
      next: (data) => {
        this.movies = data.results;
        this.totalPages = data.total_pages;
        this.totalResults = data.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.errorMessage = 'Error al cargar las películas. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }
  
  loadMoviesWithFilters(): void {
    this.apiService.discoverMovies(this.currentFilters, this.currentPage).subscribe({
      next: (data) => {
        this.movies = data.results;
        this.totalPages = data.total_pages;
        this.totalResults = data.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies with filters:', error);
        this.errorMessage = 'Error al cargar las películas. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadMovies(); // Cargar películas inmediatamente
    
    // Actualizar la URL con el nuevo número de página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge'
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  onFiltersChanged(filters: MovieFilters): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    
    // Si no estamos en la categoría discover, navegar a ella
    if (this.categoryType !== 'discover') {
      this.router.navigate(['/explore', 'discover'], {
        queryParams: { page: 1 }
      });
    } else {
      this.loadMoviesWithFilters();
    }
  }
  
  // Función para el trackBy de ngFor
  trackMovieById(index: number, movie: Movie): number {
    return movie.id;
  }
}
