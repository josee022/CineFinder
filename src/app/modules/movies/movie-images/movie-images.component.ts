import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageResponse, Image } from '../../../core/models/movie.model';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-movie-images',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './movie-images.component.html',
  styleUrls: ['./movie-images.component.scss']
})
export class MovieImagesComponent implements OnInit {
  @Input() images: ImageResponse | undefined;
  @Input() title: string = '';
  
  selectedTabIndex = 0;
  
  constructor(private dialog: MatDialog) {}
  
  ngOnInit(): void {}
  
  openImageViewer(images: Image[], index: number): void {
    this.dialog.open(ImageViewerComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: {
        images: images,
        startIndex: index,
        title: this.title
      }
    });
  }
  
  getImageUrl(path: string, size: string = 'w300'): string {
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
  
  hasImages(): boolean {
    if (!this.images) return false;
    
    return (
      (this.images.backdrops && this.images.backdrops.length > 0) ||
      (this.images.posters && this.images.posters.length > 0) ||
      (this.images.logos && this.images.logos.length > 0)
    );
  }
}
