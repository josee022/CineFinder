import { Component, OnInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-category',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './movie-category.component.html',
  styleUrls: ['./movie-category.component.scss']
})
export class MovieCategoryComponent implements OnInit {
  @Input() categoryType: 'popular' | 'top-rated' | 'upcoming' = 'popular';
  
  movies: Movie[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Paginación
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize = 20;
  
  // Títulos de categorías en español
  categoryTitles = {
    'popular': 'Películas Populares',
    'top-rated': 'Películas Mejor Valoradas',
    'upcoming': 'Próximos Estrenos'
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private scrollService: ScrollService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.loadMovies();
      this.scrollService.scrollToTop();
    });
  }

  loadMovies(): void {
    this.isLoading = true;
    
    let apiCall;
    
    switch (this.categoryType) {
      case 'popular':
        apiCall = this.apiService.getPopularMovies(this.currentPage);
        break;
      case 'top-rated':
        apiCall = this.apiService.getTopRatedMovies(this.currentPage);
        break;
      case 'upcoming':
        apiCall = this.apiService.getUpcomingMovies(this.currentPage);
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
        this.errorMessage = `Error al cargar las ${this.categoryTitles[this.categoryType].toLowerCase()}. Por favor, inténtalo de nuevo más tarde.`;
        this.isLoading = false;
        console.error(`Error loading ${this.categoryType} movies:`, error);
      }
    });
  }

  onPageChange(pageNumber: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.scrollService.scrollToTop();
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  trackMovieById(index: number, movie: Movie): number {
    return movie.id;
  }
}
