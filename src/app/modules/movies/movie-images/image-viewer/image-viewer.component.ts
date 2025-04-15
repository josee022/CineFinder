import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Image } from '../../../../core/models/movie.model';

interface DialogData {
  images: Image[];
  startIndex: number;
  title: string;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
  currentIndex: number;
  images: Image[];
  title: string;
  
  constructor(
    public dialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.images = data.images;
    this.currentIndex = data.startIndex;
    this.title = data.title;
  }
  
  ngOnInit(): void {
    // Añadir escucha de teclas para navegación
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  ngOnDestroy(): void {
    // Eliminar escucha de teclas al cerrar
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'Escape') {
      this.closeDialog();
    }
  }
  
  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Volver al principio
    }
  }
  
  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.images.length - 1; // Ir al final
    }
  }
  
  closeDialog(): void {
    this.dialogRef.close();
  }
  
  getImageUrl(path: string, size: string = 'original'): string {
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}
