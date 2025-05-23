import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SearchComponent } from '../../../shared/components/search/search.component';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    SearchComponent,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // Categorías principales
  mainNavItems = [
    { label: 'common.home', path: '/home', icon: 'home' }
  ];
  
  // Categorías de películas para el menú desplegable
  movieCategories = [
    { label: 'common.popular', path: '/movies/popular', icon: 'trending_up' },
    { label: 'common.topRated', path: '/movies/top-rated', icon: 'star' },
    { label: 'common.upcoming', path: '/movies/upcoming', icon: 'event' }
  ];
  
  // Categorías de series para el menú desplegable
  tvCategories = [
    { label: 'common.popularTVShows', path: '/tv/popular', icon: 'trending_up' },
    { label: 'common.topRatedTVShows', path: '/tv/top-rated', icon: 'star' },
    { label: 'common.onTheAirTVShows', path: '/tv/on-the-air', icon: 'live_tv' },
    { label: 'common.airingTodayTVShows', path: '/tv/airing-today', icon: 'today' }
  ];
  
  // Categorías de personas para el menú desplegable
  peopleCategories = [
    { label: 'common.popularPeople', path: '/people', icon: 'people' },
    { label: 'common.searchPeople', path: '/people/search', icon: 'person_search' }
  ];
  
  // Categorías de exploración para el menú desplegable
  exploreCategories = [
    { label: 'common.discover', path: '/explore/discover', icon: 'explore' }
  ];
  
  isMobileMenuOpen = false;
  
  constructor(private translationService: TranslationService) {}
  
  ngOnInit(): void {
    // Suscribirse a cambios de idioma si es necesario
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
