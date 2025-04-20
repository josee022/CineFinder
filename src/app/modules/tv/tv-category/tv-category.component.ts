import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../../core/api.service';
import { TVShow } from '../../../core/models/tv.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TVFiltersComponent } from '../tv-filters/tv-filters.component';
import { MovieFilters } from '../../../core/models/filters.model';

@Component({
  selector: 'app-tv-category',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslatePipe,
    TVFiltersComponent
  ],
  templateUrl: './tv-category.component.html',
  styleUrls: ['./tv-category.component.scss']
})
export class TVCategoryComponent implements OnInit {
  tvShows: TVShow[] = [];
  isLoading = true;
  errorMessage = '';
  categoryType = 'popular';
  categoryTitles: { [key: string]: string } = {
    'popular': 'Series Populares',
    'top-rated': 'Series Mejor Valoradas',
    'on-the-air': 'Series en Emisión',
    'airing-today': 'Series Emitidas Hoy'
  };
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize = 20;
  showFilters = false;
  currentFilters: MovieFilters = {};
  genresMap: { [id: number]: string } = {};

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener el tipo de categoría de los parámetros de la ruta o de los datos de la ruta
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      if (category) {
        this.categoryType = category;
      } else {
        this.route.data.subscribe(data => {
          if (data['categoryType']) {
            this.categoryType = data['categoryType'];
          }
        });
      }
      
      this.setCategoryTitle();
      this.loadGenres();
      this.loadTVShows();
    });
  }

  setCategoryTitle(): void {
    // No necesitamos establecer un título separado, ya que usamos categoryTitles directamente en la plantilla
  }

  loadGenres(): void {
    // Cargar géneros de la API
    this.apiService.getTVGenres().subscribe({
      next: (genres) => {
        // Crear un mapa de géneros para acceso rápido
        genres.forEach(genre => {
          this.genresMap[genre.id] = genre.name;
        });
      },
      error: (error) => {
        console.error('Error loading genres:', error);
      }
    });
  }

  loadTVShows(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    let apiCall;
    
    // Si hay filtros activos, usar el método de descubrimiento
    if (Object.keys(this.currentFilters).length > 0 && 
        (this.currentFilters.sortBy || this.currentFilters.year || 
         (this.currentFilters.genres && this.currentFilters.genres.length > 0) || 
         (this.currentFilters.voteAverageGte !== undefined && this.currentFilters.voteAverageGte > 0))) {
      this.loadTVShowsWithFilters();
      return;
    }
    
    switch (this.categoryType) {
      case 'popular':
        apiCall = this.apiService.getPopularTVShows(this.currentPage);
        break;
      case 'top-rated':
        apiCall = this.apiService.getTopRatedTVShows(this.currentPage);
        break;
      case 'on-the-air':
        apiCall = this.apiService.getOnTheAirTVShows(this.currentPage);
        break;
      case 'airing-today':
        apiCall = this.apiService.getAiringTodayTVShows(this.currentPage);
        break;
      default:
        apiCall = this.apiService.getPopularTVShows(this.currentPage);
    }
    
    apiCall.subscribe({
      next: (response) => {
        this.tvShows = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading TV shows:', error);
        this.errorMessage = 'Error al cargar las series. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  loadTVShowsWithFilters(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.discoverTVShows(this.currentFilters, this.currentPage).subscribe({
      next: (response) => {
        this.tvShows = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading TV shows with filters:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las series. Intenta de nuevo.';
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadTVShows();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  onFiltersChanged(filters: MovieFilters): void {
    this.currentFilters = filters;
    this.currentPage = 1; // Resetear a la primera página cuando cambian los filtros
    this.loadTVShowsWithFilters();
    
    // Actualizar la URL con el nuevo número de página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge'
    });
  }
  
  getTVShowGenres(tvShowId: number): string[] {
    const tvShow = this.tvShows.find(t => t.id === tvShowId);
    if (!tvShow || !tvShow.genre_ids) return [];
    
    return tvShow.genre_ids
      .map(id => this.genresMap[id])
      .filter(name => name !== undefined);
  }
  
  trackTVShowById(index: number, tvShow: TVShow): number {
    return tvShow.id;
  }

  navigateToTVShowDetail(id: number): void {
    this.router.navigate(['/tv', id]);
  }

  getImageUrl(path: string | null): string {
    if (path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    // Usar una URL de placeholder en lugar de una imagen local
    return 'https://via.placeholder.com/500x750?text=No+Poster';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Desconocido';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
