import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  Math = Math; // Exponer Math para usarlo en la plantilla
  
  socialLinks = [
    { icon: 'public', url: 'https://facebook.com', name: 'Facebook' },
    { icon: 'share', url: 'https://twitter.com', name: 'Twitter' },
    { icon: 'photo_camera', url: 'https://instagram.com', name: 'Instagram' },
    { icon: 'videocam', url: 'https://youtube.com', name: 'YouTube' },
    { icon: 'send', url: 'https://telegram.org', name: 'Telegram' }
  ];
  
  exploreLinks = [
    { icon: 'home', label: 'Inicio', path: '/home' },
    { icon: 'movie', label: 'Películas', path: '/movies/popular' },
    { icon: 'trending_up', label: 'Populares', path: '/movies/popular' },
    { icon: 'star', label: 'Mejor valoradas', path: '/movies/top-rated' },
    { icon: 'upcoming', label: 'Próximos estrenos', path: '/movies/upcoming' },
    { icon: 'search', label: 'Buscar', path: '/search' }
  ];
}
