import { Component } from '@angular/core';
import { MovieCategoryComponent } from '../movie-category/movie-category.component';

@Component({
  selector: 'app-upcoming-movies',
  standalone: true,
  imports: [MovieCategoryComponent],
  template: `<app-movie-category categoryType="upcoming"></app-movie-category>`,
})
export class UpcomingMoviesComponent {}
