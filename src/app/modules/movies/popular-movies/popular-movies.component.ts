import { Component } from '@angular/core';
import { MovieCategoryComponent } from '../movie-category/movie-category.component';

@Component({
  selector: 'app-popular-movies',
  standalone: true,
  imports: [MovieCategoryComponent],
  template: `<app-movie-category categoryType="popular"></app-movie-category>`,
})
export class PopularMoviesComponent {}
