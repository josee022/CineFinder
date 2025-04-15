import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ApiService } from '../../../core/api.service';
import { MovieFilters, SortOption } from '../../../core/models/filters.model';
import { Genre } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './movie-filters.component.html',
  styleUrls: ['./movie-filters.component.scss']
})
export class MovieFiltersComponent implements OnInit {
  @Input() initialFilters: MovieFilters = {};
  @Output() filtersChanged = new EventEmitter<MovieFilters>();
  
  filtersForm!: FormGroup;
  genres: Genre[] = [];
  isLoading = false;
  
  sortOptions: { value: SortOption, label: string }[] = [
    { value: 'popularity.desc', label: 'filters.popularityDesc' },
    { value: 'popularity.asc', label: 'filters.popularityAsc' },
    { value: 'vote_average.desc', label: 'filters.ratingDesc' },
    { value: 'vote_average.asc', label: 'filters.ratingAsc' },
    { value: 'release_date.desc', label: 'filters.releaseDateDesc' },
    { value: 'release_date.asc', label: 'filters.releaseDateAsc' },
    { value: 'revenue.desc', label: 'filters.revenueDesc' },
    { value: 'revenue.asc', label: 'filters.revenueAsc' }
  ];
  
  years: number[] = [];
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    // Generar años desde 1900 hasta el año actual
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }
  
  ngOnInit(): void {
    this.createForm();
    this.loadGenres();
    
    // Suscribirse a cambios en el formulario
    this.filtersForm.valueChanges.subscribe(values => {
      this.updateFilters();
    });
  }
  
  createForm(): void {
    this.filtersForm = this.fb.group({
      sortBy: [this.initialFilters.sortBy || 'popularity.desc'],
      year: [this.initialFilters.year || null],
      genres: [this.initialFilters.genres || []],
      voteAverageGte: [this.initialFilters.voteAverageGte || 0],
      includeAdult: [this.initialFilters.includeAdult || false]
    });
  }
  
  loadGenres(): void {
    this.isLoading = true;
    this.apiService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.isLoading = false;
      }
    });
  }
  
  updateFilters(): void {
    const formValues = this.filtersForm.value;
    
    const filters: MovieFilters = {
      sortBy: formValues.sortBy,
      year: formValues.year,
      genres: formValues.genres && formValues.genres.length > 0 ? formValues.genres : undefined,
      voteAverageGte: formValues.voteAverageGte > 0 ? formValues.voteAverageGte : undefined,
      includeAdult: formValues.includeAdult
    };
    
    // No emitimos el evento aquí para que los filtros no se apliquen automáticamente
  }
  
  applyFilters(): void {
    const formValues = this.filtersForm.value;
    
    const filters: MovieFilters = {
      sortBy: formValues.sortBy,
      year: formValues.year,
      genres: formValues.genres && formValues.genres.length > 0 ? formValues.genres : undefined,
      voteAverageGte: formValues.voteAverageGte > 0 ? formValues.voteAverageGte : undefined,
      includeAdult: formValues.includeAdult
    };
    
    this.filtersChanged.emit(filters);
  }
  
  resetFilters(): void {
    this.filtersForm.reset({
      sortBy: 'popularity.desc',
      year: null,
      genres: [],
      voteAverageGte: 0,
      includeAdult: false
    });
    
    this.applyFilters();
  }
  
  // Helpers para la interfaz
  compareGenres(genre1: number, genre2: number): boolean {
    return genre1 === genre2;
  }
}
