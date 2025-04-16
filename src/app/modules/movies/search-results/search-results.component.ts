import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Paginación
  currentPage: number = 1;
  totalPages: number = 0;
  totalResults: number = 0;
  pageSize: number = 20;
  
  // Filtros
  keywordId: number | null = null;
  keywordName: string = '';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private scrollService: ScrollService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const query = params.get('query');
      const page = Number(params.get('page')) || 1;
      const withKeywords = params.get('with_keywords');
      const keywordName = params.get('keyword_name');
      
      if (query) {
        this.searchQuery = query;
        this.currentPage = page;
        this.searchMovies();
      } else if (withKeywords) {
        this.keywordId = Number(withKeywords);
        this.keywordName = keywordName || '';
        this.searchByKeyword();
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  searchMovies(): void {
    this.isLoading = true;
    this.scrollService.scrollToTop();
    
    this.apiService.searchMovies(this.searchQuery, this.currentPage).subscribe({
      next: (response) => {
        this.searchResults = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.errorMessage = 'Error al buscar películas. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  searchByKeyword(): void {
    if (!this.keywordId) return;
    
    this.isLoading = true;
    this.scrollService.scrollToTop();
    
    this.apiService.discoverMovies({
      with_keywords: [this.keywordId]
    }, this.currentPage).subscribe({
      next: (response) => {
        this.searchResults = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching movies by keyword:', error);
        this.errorMessage = 'Error al buscar películas por palabra clave. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(pageNumber: number): void {
    // Preparar los parámetros de consulta según el tipo de búsqueda
    let queryParams: any = { page: pageNumber };
    
    if (this.searchQuery) {
      // Búsqueda normal por texto
      queryParams.query = this.searchQuery;
    } else if (this.keywordId) {
      // Búsqueda por palabra clave
      queryParams.with_keywords = this.keywordId;
      if (this.keywordName) {
        queryParams.keyword_name = this.keywordName;
      }
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    }).then(() => {
      // Actualizar la página actual y volver a cargar los resultados
      this.currentPage = pageNumber;
      
      // Cargar los resultados según el tipo de búsqueda
      if (this.searchQuery) {
        this.searchMovies();
      } else if (this.keywordId) {
        this.searchByKeyword();
      }
      
      this.scrollService.scrollToTop();
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}
