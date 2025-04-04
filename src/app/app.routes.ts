import { Routes } from '@angular/router';
import { MovieListComponent } from './modules/movies/movie-list/movie-list.component';
import { MovieDetailComponent } from './modules/movies/movie-detail/movie-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: MovieListComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  { path: 'popular', component: MovieListComponent },
  { path: 'top-rated', component: MovieListComponent },
  { path: 'upcoming', component: MovieListComponent },
  { path: '**', redirectTo: 'movies' } // Ruta comodín para manejar rutas no encontradas
];
