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
  
  socialLinks = [
    { icon: 'facebook', url: 'https://facebook.com' },
    { icon: 'twitter', url: 'https://twitter.com' },
    { icon: 'instagram', url: 'https://instagram.com' },
    { icon: 'youtube', url: 'https://youtube.com' }
  ];
  
  footerLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Movies', path: '/movies' },
    { label: 'Popular', path: '/popular' },
    { label: 'Top Rated', path: '/top-rated' },
    { label: 'Upcoming', path: '/upcoming' }
  ];
}
