import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { ApiService } from '../../core/api.service';
import { ScrollService } from '../../core/services/scroll.service';
import { Movie } from '../../core/models/movie.model';

import { Subject, forkJoin, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  popularMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  
  isLoading = true;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private apiService: ApiService,
    private scrollService: ScrollService
  ) {}
  
  ngOnInit(): void {
    this.loadHomeData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadHomeData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.scrollService.scrollToTop();
    
    // Cargar datos de películas populares, mejor valoradas y próximos estrenos
    forkJoin({
      popular: this.apiService.getPopularMovies(1),
      topRated: this.apiService.getTopRatedMovies(1),
      upcoming: this.apiService.getUpcomingMovies(1)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.popularMovies = results.popular.results.slice(0, 6);
        this.topRatedMovies = results.topRated.results.slice(0, 6);
        this.upcomingMovies = results.upcoming.results.slice(0, 6);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error cargando datos de inicio:', error);
      }
    });
  }
  
  // Obtener URL de póster
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) return 'assets/images/no-poster.png';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }
  
  // Obtener URL de backdrop
  getBackdropUrl(backdropPath: string | null): string {
    if (!backdropPath) return '';
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  }
  
  // Truncar texto
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
