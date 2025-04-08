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
      
      if (query) {
        this.searchQuery = query;
        this.currentPage = page;
        this.searchMovies();
        this.scrollService.scrollToTop();
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  searchMovies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.searchMovies(this.searchQuery, this.currentPage).subscribe({
      next: (data) => {
        this.searchResults = data.results;
        this.totalPages = data.total_pages;
        this.totalResults = data.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al buscar películas. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error searching movies:', error);
      }
    });
  }

  onPageChange(pageNumber: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        query: this.searchQuery,
        page: pageNumber 
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.scrollService.scrollToTop();
    });
  }

  navigateToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}
