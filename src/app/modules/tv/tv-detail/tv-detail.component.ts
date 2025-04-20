import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/api.service';
import { TVShowDetails, Creator } from '../../../core/models/tv.model';
import { Cast, Crew } from '../../../core/models/movie.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-tv-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    TranslatePipe,
    SafeUrlPipe
  ],
  templateUrl: './tv-detail.component.html',
  styleUrls: ['./tv-detail.component.scss']
})
export class TVDetailComponent implements OnInit {
  tvId!: number;
  tvShow: TVShowDetails | null = null;
  isLoading = true;
  errorMessage = '';
  expandedOverview = false;
  
  // Datos para mostrar en la UI
  directors: Crew[] = [];
  writers: Crew[] = [];
  cast: Cast[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.tvId = id;
        this.loadTVShowDetails();
      } else {
        this.router.navigate(['/tv']);
      }
    });
  }

  loadTVShowDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getTVShowDetail(this.tvId).subscribe({
      next: (response) => {
        this.tvShow = response;
        
        // Procesar el reparto y equipo
        if (response.credits) {
          // Obtener directores (personas con trabajo de 'Director')
          this.directors = response.credits.crew.filter(person => 
            person.job === 'Director'
          );
          
          // Obtener escritores (personas con trabajos relacionados con escritura)
          this.writers = response.credits.crew.filter(person => 
            person.job === 'Writer' || 
            person.job === 'Screenplay' || 
            person.job === 'Story' ||
            person.department === 'Writing'
          );
          
          // Obtener reparto principal (limitado a los primeros 10)
          this.cast = response.credits.cast
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .slice(0, 10);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los detalles de la serie. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error fetching TV show details:', error);
      }
    });
  }

  getBackdropUrl(): string {
    if (this.tvShow?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${this.tvShow.backdrop_path}`;
    }
    return 'assets/images/no-backdrop.png';
  }

  getPosterUrl(): string {
    if (this.tvShow?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${this.tvShow.poster_path}`;
    }
    return 'assets/images/no-poster.png';
  }

  getProfileUrl(path: string | null): string {
    if (path) {
      return `https://image.tmdb.org/t/p/w185${path}`;
    }
    return 'assets/images/no-profile.png';
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

  formatRuntime(minutes: number[]): string {
    if (!minutes || minutes.length === 0) return 'Desconocido';
    
    // Calcular el promedio si hay múltiples duraciones
    const avgMinutes = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    
    const hours = Math.floor(avgMinutes / 60);
    const mins = avgMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  toggleOverview(): void {
    this.expandedOverview = !this.expandedOverview;
  }

  navigateToPerson(personId: number): void {
    this.router.navigate(['/people', personId]);
  }
}
