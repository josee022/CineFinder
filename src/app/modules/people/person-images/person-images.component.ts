import { Component, Input, OnInit } from '@angular/core';
import { Image } from '../../../core/models/person.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-person-images',
  templateUrl: './person-images.component.html',
  styleUrls: ['./person-images.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, DecimalPipe]
})
export class PersonImagesComponent implements OnInit {
  @Input() images: Image[] = [];
  @Input() personName: string = '';
  
  selectedImage: Image | null = null;
  lightboxOpen = false;

  // Paginación
  page: number = 1;
  pageSize: number = 25; // 5x5 grid

  get paginatedImages(): Image[] {
    const start = (this.page - 1) * this.pageSize;
    return this.images.slice(start, start + this.pageSize);
  }
  get totalPages(): number {
    return Math.ceil(this.images.length / this.pageSize) || 1;
  }
  goToPage(page: number) {
    this.page = page;
  }

  constructor() { }

  ngOnInit(): void {
  }

  getImageUrl(image: Image, size: string = 'w185'): string {
    return `https://image.tmdb.org/t/p/${size}${image.file_path}`;
  }

  openLightbox(image: Image): void {
    this.selectedImage = image;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = 'auto'; // Restaurar scroll
  }

  nextImage(): void {
    if (!this.selectedImage) return;
    
    const currentIndex = this.images.findIndex(img => img.file_path === this.selectedImage?.file_path);
    if (currentIndex < this.images.length - 1) {
      this.selectedImage = this.images[currentIndex + 1];
    }
  }

  prevImage(): void {
    if (!this.selectedImage) return;
    
    const currentIndex = this.images.findIndex(img => img.file_path === this.selectedImage?.file_path);
    if (currentIndex > 0) {
      this.selectedImage = this.images[currentIndex - 1];
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.lightboxOpen) {
      if (event.key === 'Escape') {
        this.closeLightbox();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
    }
  }
}
