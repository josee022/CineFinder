import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent),
    title: 'CineFinder - Inicio'
  },
  {
    path: 'movies/popular',
    loadComponent: () => import('./modules/movies/movie-category/movie-category.component').then(m => m.MovieCategoryComponent),
    data: { categoryType: 'popular' },
    title: 'CineFinder - Películas Populares'
  },
  {
    path: 'movies/top-rated',
    loadComponent: () => import('./modules/movies/movie-category/movie-category.component').then(m => m.MovieCategoryComponent),
    data: { categoryType: 'top-rated' },
    title: 'CineFinder - Películas Mejor Valoradas'
  },
  {
    path: 'movies/upcoming',
    loadComponent: () => import('./modules/movies/movie-category/movie-category.component').then(m => m.MovieCategoryComponent),
    data: { categoryType: 'upcoming' },
    title: 'CineFinder - Próximos Estrenos'
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./modules/movies/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent),
    title: 'CineFinder - Detalle de Película'
  },
  {
    path: 'search',
    loadComponent: () => import('./modules/movies/search-results/search-results.component').then(m => m.SearchResultsComponent),
    title: 'CineFinder - Resultados de Búsqueda'
  },
  {
    path: 'explore',
    children: [
      {
        path: 'filters',
        loadComponent: () => import('./modules/movies/advanced-filters/advanced-filters.component').then(m => m.AdvancedFiltersComponent),
        title: 'CineFinder - Filtros Avanzados'
      },
      {
        path: 'discover',
        loadComponent: () => import('./modules/movies/discover-results/discover-results.component').then(m => m.DiscoverResultsComponent),
        title: 'CineFinder - Descubrir Películas'
      },
      {
        path: 'calendar',
        loadComponent: () => import('./modules/movies/release-calendar/release-calendar.component').then(m => m.ReleaseCalendarComponent),
        title: 'CineFinder - Calendario de Estrenos'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'CineFinder - Página no encontrada'
  }
];
