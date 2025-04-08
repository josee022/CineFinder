import { Routes } from '@angular/router';
import { MovieListComponent } from './modules/movies/movie-list/movie-list.component';
import { MovieDetailComponent } from './modules/movies/movie-detail/movie-detail.component';
import { SearchResultsComponent } from './modules/movies/search-results/search-results.component';
import { HomeComponent } from './modules/movies/home/home.component';
import { PopularMoviesComponent } from './modules/movies/popular-movies/popular-movies.component';
import { TopRatedMoviesComponent } from './modules/movies/top-rated-movies/top-rated-movies.component';
import { UpcomingMoviesComponent } from './modules/movies/upcoming-movies/upcoming-movies.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'movies', component: MovieListComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  { path: 'popular', component: PopularMoviesComponent },
  { path: 'top-rated', component: TopRatedMoviesComponent },
  { path: 'upcoming', component: UpcomingMoviesComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: '**', redirectTo: 'home' } // Ruta comodín para manejar rutas no encontradas
];
