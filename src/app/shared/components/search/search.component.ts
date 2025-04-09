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
import { Subject } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { Movie } from '../../../core/models/movie.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

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
    MatAutocompleteModule,
    TranslatePipe
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
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    
    // Suscribirse a cambios de idioma para actualizar resultados si es necesario
    this.translationService.onLangChange.subscribe(() => {
      if (this.searchQuery && this.searchQuery.length >= 2) {
        this.searchSubject.next(this.searchQuery);
      }
    });
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
      next: (results) => {
        this.searchResults = results.results.slice(0, 5);
        this.isLoading = false;
        this.showResults = true;
      },
      error: () => {
        this.isLoading = false;
        this.searchResults = [];
      }
    });
  }

  onSearchInput(): void {
    this.showResults = true;
    this.searchSubject.next(this.searchQuery);
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
      this.hideResults();
    }
  }

  navigateToMovie(id: number): void {
    this.router.navigate(['/movies', id]);
    this.hideResults();
    this.searchQuery = '';
  }

  hideResults(): void {
    // Usamos setTimeout para permitir que el clic en un resultado funcione antes de ocultar
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }
}
