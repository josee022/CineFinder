import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { Movie, Genre, MovieResponse } from '../../../core/models/movie.model';
import { MovieFilters } from '../../../core/models/filters.model';
import { MovieFiltersComponent } from '../movie-filters/movie-filters.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Observable } from 'rxjs';

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
  
  // Géneros
  genres: Genre[] = [];
  movieGenresMap: Map<number, string[]> = new Map();
  
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
    // Cargar los géneros primero
    this.loadGenres();
    
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

  loadGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        // Si ya tenemos películas cargadas, mapeamos los géneros inmediatamente
        if (this.movies.length > 0) {
          this.mapGenresToMovies();
        }
      },
      error: (error) => {
        console.error('Error loading genres:', error);
      }
    });
  }
  
  loadMovies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.scrollService.scrollToTop();
    
    // Mapeo de tipos de categoría para manejar guiones y guiones bajos
    const categoryTypeMap: Record<string, string> = {
      'top-rated': 'top_rated',
      'now-playing': 'now_playing'
    };
    
    const mappedType = categoryTypeMap[this.categoryType] || this.categoryType;
    
    let apiCall: Observable<MovieResponse>;
    
    switch (mappedType) {
      case 'popular':
        apiCall = this.apiService.getPopularMovies(this.currentPage);
        break;
      case 'top_rated':
        apiCall = this.apiService.getTopRatedMovies(this.currentPage);
        break;
      case 'upcoming':
        apiCall = this.apiService.getUpcomingMovies(this.currentPage);
        break;
      case 'now_playing':
        apiCall = this.apiService.getNowPlayingMovies(this.currentPage);
        break;
      default:
        apiCall = this.apiService.getPopularMovies(this.currentPage);
    }
    
    apiCall.subscribe({
      next: (response: MovieResponse) => {
        this.movies = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
        this.errorMessage = '';
        
        // Mapear los géneros a las películas
        if (this.genres.length > 0) {
          this.mapGenresToMovies();
        } else {
          // Si los géneros aún no se han cargado, los cargamos primero
          this.loadGenres();
        }
      },
      error: (error: any) => {
        console.error('Error loading movies:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las películas. Intenta de nuevo.';
      }
    });
  }
  
  loadMoviesWithFilters(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.discoverMovies(this.currentFilters, this.currentPage).subscribe({
      next: (response: MovieResponse) => {
        this.movies = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
        
        // Mapear los géneros a las películas
        if (this.genres.length > 0) {
          this.mapGenresToMovies();
        } else {
          // Si los géneros aún no se han cargado, los cargamos primero
          this.loadGenres();
        }
      },
      error: (error: any) => {
        console.error('Error loading movies with filters:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las películas. Intenta de nuevo.';
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
    this.loadMoviesWithFilters();
    
    // Actualizar la URL con el nuevo número de página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge'
    });
  }
  
  // Función para el trackBy de ngFor
  trackMovieById(index: number, movie: Movie): number {
    return movie.id;
  }
  
  // Mapear los géneros a las películas
  mapGenresToMovies(): void {
    this.movieGenresMap.clear();
    
    if (this.genres.length === 0 || this.movies.length === 0) {
      return;
    }
    
    this.movies.forEach(movie => {
      if (movie.genre_ids && movie.genre_ids.length > 0) {
        const genreNames = movie.genre_ids
          .map(genreId => this.genres.find(g => g.id === genreId)?.name)
          .filter(name => name !== undefined) as string[];
        
        this.movieGenresMap.set(movie.id, genreNames);
      }
    });
    
    console.log('Géneros mapeados:', this.movieGenresMap);
  }
  
  // Obtener los géneros de una película
  getMovieGenres(movieId: number): string[] {
    return this.movieGenresMap.get(movieId) || [];
  }
}
