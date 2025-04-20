import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieCredit, TVCredit } from '../../../core/models/person.model';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-person-filmography',
  templateUrl: './person-filmography.component.html',
  styleUrls: ['./person-filmography.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, DecimalPipe]
})
export class PersonFilmographyComponent implements OnInit {
  @Input() movieCredits: MovieCredit[] = [];
  @Input() tvCredits: TVCredit[] = [];
  
  // Filtros
  activeTab: 'movies' | 'tv' = 'movies';
  sortBy: 'popularity' | 'release_date' | 'title' = 'popularity';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Datos filtrados
  filteredMovies: MovieCredit[] = [];
  filteredTVShows: TVCredit[] = [];

  // Paginación
  moviesPage: number = 1;
  tvPage: number = 1;
  pageSize: number = 25; // 5x5 grid

  get paginatedMovies(): MovieCredit[] {
    const start = (this.moviesPage - 1) * this.pageSize;
    return this.filteredMovies.slice(start, start + this.pageSize);
  }
  get paginatedTV(): TVCredit[] {
    const start = (this.tvPage - 1) * this.pageSize;
    return this.filteredTVShows.slice(start, start + this.pageSize);
  }
  get moviesTotalPages(): number {
    return Math.ceil(this.filteredMovies.length / this.pageSize) || 1;
  }
  get tvTotalPages(): number {
    return Math.ceil(this.filteredTVShows.length / this.pageSize) || 1;
  }
  goToMoviesPage(page: number) {
    this.moviesPage = page;
  }
  goToTVPage(page: number) {
    this.tvPage = page;
  }

  onTVClick(tvId: number) {
    this.router.navigate(['/tv', tvId]);
  }

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    // Filtrar y ordenar películas
    if (this.activeTab === 'movies') {
      this.filteredMovies = [...this.movieCredits];
      
      // Ordenar
      this.filteredMovies.sort((a, b) => {
        if (this.sortBy === 'popularity') {
          return this.sortDirection === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity;
        } else if (this.sortBy === 'release_date') {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return this.sortDirection === 'desc' 
            ? (b.title ?? '').localeCompare(a.title ?? '') 
            : (a.title ?? '').localeCompare(b.title ?? '');
        }
      });
    } 
    // Filtrar y ordenar series de TV
    else {
      this.filteredTVShows = [...this.tvCredits];
      
      // Ordenar
      this.filteredTVShows.sort((a, b) => {
        if (this.sortBy === 'popularity') {
          return this.sortDirection === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity;
        } else if (this.sortBy === 'release_date') {
          const dateA = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
          const dateB = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
          return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return this.sortDirection === 'desc' 
            ? b.name.localeCompare(a.name) 
            : a.name.localeCompare(b.name);
        }
      });
    }
  }

  setActiveTab(tab: 'movies' | 'tv'): void {
    this.activeTab = tab;
    this.applyFilters();
    // Reset page on tab change
    if (tab === 'movies') this.moviesPage = 1;
    if (tab === 'tv') this.tvPage = 1;
  }

  setSortBy(sort: 'popularity' | 'release_date' | 'title'): void {
    if (this.sortBy === sort) {
      // Cambiar dirección si ya está seleccionado
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortBy = sort;
      // Por defecto, popularidad y fecha en descendente, título en ascendente
      this.sortDirection = sort === 'title' ? 'asc' : 'desc';
    }
    this.applyFilters();
  }

  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  getYear(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    return dateString.substring(0, 4);
  }

  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return `https://image.tmdb.org/t/p/w92${posterPath}`;
    }
    return 'assets/placeholder.jpg';
  }
}
