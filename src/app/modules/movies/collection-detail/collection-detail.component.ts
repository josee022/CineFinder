import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/api.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface CollectionDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: any[];
}

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {
  collection: CollectionDetails | null = null;
  isLoading = true;
  errorMessage = '';
  collectionId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {
    this.loadCollection();
  }

  loadCollection(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id) && +id > 0) {
      this.collectionId = +id;
      this.isLoading = true;
      this.collection = null;
      this.scrollService.scrollToTop();

      this.apiService.getCollection(this.collectionId).subscribe({
        next: (data: CollectionDetails) => {
          this.collection = data;
          // Ordenar las películas por fecha de lanzamiento
          if (this.collection.parts) {
            this.collection.parts.sort((a, b) => {
              // Si no tiene fecha de lanzamiento, ponerla al final
              if (!a.release_date) return 1;
              if (!b.release_date) return -1;
              // Ordenar por fecha de lanzamiento (más antiguas primero)
              return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
            });
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = 'Error al cargar los detalles de la colección. Por favor, inténtalo de nuevo más tarde.';
          this.isLoading = false;
          console.error('Error loading collection details:', error);
        }
      });
    } else {
      this.router.navigate(['/home']);
      this.errorMessage = 'ID de colección no válido.';
      this.isLoading = false;
    }
  }

  getBackdropUrl(): string {
    return this.collection?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${this.collection.backdrop_path}`
      : '';
  }

  getPosterUrl(): string {
    return this.collection?.poster_path 
      ? `https://image.tmdb.org/t/p/w500${this.collection.poster_path}`
      : 'assets/placeholder.jpg';
  }

  getMoviePosterUrl(posterPath: string | null): string {
    return posterPath 
      ? `https://image.tmdb.org/t/p/w300${posterPath}`
      : 'assets/placeholder.jpg';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}
