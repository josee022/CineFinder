import { Routes } from '@angular/router';
import { PeopleModule } from './modules/people/people.module';

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
    path: 'collection/:id',
    loadComponent: () => import('./modules/movies/collection-detail/collection-detail.component').then(m => m.CollectionDetailComponent),
    title: 'CineFinder - Colección'
  },
  {
    path: 'search',
    loadComponent: () => import('./modules/movies/search-results/search-results.component').then(m => m.SearchResultsComponent),
    title: 'CineFinder - Resultados de Búsqueda'
  },
  {
    path: 'tv',
    children: [
      {
        path: '',
        redirectTo: 'popular',
        pathMatch: 'full'
      },
      {
        path: 'popular',
        loadComponent: () => import('./modules/tv/tv-category/tv-category.component').then(m => m.TVCategoryComponent),
        data: { categoryType: 'popular' },
        title: 'CineFinder - Series Populares'
      },
      {
        path: 'top-rated',
        loadComponent: () => import('./modules/tv/tv-category/tv-category.component').then(m => m.TVCategoryComponent),
        data: { categoryType: 'top-rated' },
        title: 'CineFinder - Series Mejor Valoradas'
      },
      {
        path: 'on-the-air',
        loadComponent: () => import('./modules/tv/tv-category/tv-category.component').then(m => m.TVCategoryComponent),
        data: { categoryType: 'on-the-air' },
        title: 'CineFinder - Series en Emisión'
      },
      {
        path: 'airing-today',
        loadComponent: () => import('./modules/tv/tv-category/tv-category.component').then(m => m.TVCategoryComponent),
        data: { categoryType: 'airing-today' },
        title: 'CineFinder - Series Hoy'
      },
      {
        path: ':id',
        loadComponent: () => import('./modules/tv/tv-detail/tv-detail.component').then(m => m.TVDetailComponent),
        title: 'CineFinder - Detalle de Serie'
      }
    ]
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
    path: 'explore/:category',
    loadComponent: () => import('./modules/movies/movie-category/movie-category.component').then(m => m.MovieCategoryComponent),
    title: 'CineFinder - Explorar Películas'
  },
  {
    path: 'people',
    loadChildren: () => import('./modules/people/people.module').then(m => m.PeopleModule),
    title: 'CineFinder - Actores y Personas'
  },
  {
    path: '**',
    loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'CineFinder - Página no encontrada'
  }
];
