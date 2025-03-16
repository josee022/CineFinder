import { Routes } from '@angular/router';
import { MovieListComponent } from '../app/modules/movies/movie-list/movie-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: MovieListComponent }
];
