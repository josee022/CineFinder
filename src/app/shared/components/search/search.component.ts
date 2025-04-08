import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  searchResults: Movie[] = [];
  isLoading = false;
  private searchSubject = new Subject<string>();
  showResults = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(query => query.length >= 2),
      switchMap(query => {
        this.isLoading = true;
        return this.apiService.searchMovies(query);
      })
    ).subscribe({
      next: (response) => {
        this.searchResults = response.results.slice(0, 5);
        this.isLoading = false;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
      this.showResults = false;
    }
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
      this.searchResults = [];
      this.showResults = false;
    }
  }

  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
    this.searchResults = [];
    this.showResults = false;
    this.searchQuery = '';
  }

  hideResults(): void {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }
}
