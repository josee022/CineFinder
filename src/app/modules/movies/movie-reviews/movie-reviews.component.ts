import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReviewResponse, Review } from '../../../core/models/movie.model';
import { ApiService } from '../../../core/api.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-movie-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './movie-reviews.component.html',
  styleUrls: ['./movie-reviews.component.scss']
})
export class MovieReviewsComponent implements OnInit {
  @Input() reviews: ReviewResponse | undefined;
  @Input() movieId: number = 0;
  
  expandedReviews: { [key: string]: boolean } = {};
  isLoading = false;
  currentPage = 1;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {}
  
  toggleReview(reviewId: string): void {
    this.expandedReviews[reviewId] = !this.expandedReviews[reviewId];
  }
  
  isReviewExpanded(reviewId: string): boolean {
    return this.expandedReviews[reviewId] || false;
  }
  
  getAvatarUrl(path: string | null): string {
    if (!path) return 'assets/images/avatar-placeholder.jpg';
    
    // Si la ruta comienza con '/http', es una URL externa
    if (path.startsWith('/http')) {
      return path.substring(1); // Eliminar la barra inicial
    }
    
    return `https://image.tmdb.org/t/p/w100_and_h100_face${path}`;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  onPageChange(event: PageEvent): void {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    
    this.apiService.getMovieReviews(this.movieId, this.currentPage).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
        this.expandedReviews = {}; // Resetear estados expandidos
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  hasReviews(): boolean {
    return !!(this.reviews?.results && this.reviews.results.length > 0);
  }
}
