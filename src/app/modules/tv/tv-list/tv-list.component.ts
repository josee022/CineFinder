import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../../core/api.service';
import { TVShow } from '../../../core/models/tv.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-tv-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    TranslatePipe
  ],
  templateUrl: './tv-list.component.html',
  styleUrls: ['./tv-list.component.scss']
})
export class TVListComponent implements OnInit {
  tvShows: TVShow[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Paginación
  currentPage = 1;
  totalPages = 0;
  totalResults = 0;
  pageSize = 20;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadPopularTVShows();
  }

  loadPopularTVShows(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getPopularTVShows(this.currentPage).subscribe({
      next: (response) => {
        this.tvShows = response.results;
        this.totalPages = response.total_pages;
        this.totalResults = response.total_results;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las series populares. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error fetching popular TV shows:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadPopularTVShows();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getImageUrl(path: string | null): string {
    if (path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    return 'assets/images/no-poster.png';
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
