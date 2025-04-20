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
  selector: 'app-tv-filters',
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
  templateUrl: './tv-filters.component.html',
  styleUrls: ['./tv-filters.component.scss']
})
export class TVFiltersComponent implements OnInit {
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
    { value: 'first_air_date.desc', label: 'filters.releaseDateDesc' },
    { value: 'first_air_date.asc', label: 'filters.releaseDateAsc' }
  ];
  
  years: number[] = [];
  currentYear = new Date().getFullYear();
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    // Generar lista de años desde 1900 hasta el año actual
    for (let year = this.currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }
  
  ngOnInit(): void {
    this.initForm();
    this.loadGenres();
    
    // Aplicar filtros iniciales si existen
    if (this.initialFilters) {
      this.applyInitialFilters();
    }
  }
  
  private initForm(): void {
    this.filtersForm = this.fb.group({
      sortBy: ['popularity.desc'],
      year: [null],
      genres: [[]],
      voteAverageGte: [0],
      includeAdult: [false]
    });
    
    // Escuchar cambios en el formulario
    this.filtersForm.valueChanges.subscribe(values => {
      this.updateFilters();
    });
  }
  
  private loadGenres(): void {
    this.isLoading = true;
    this.apiService.getTVGenres().subscribe({
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
  
  private applyInitialFilters(): void {
    const filters = this.initialFilters;
    
    if (filters.sortBy) {
      this.filtersForm.get('sortBy')?.setValue(filters.sortBy);
    }
    
    if (filters.year) {
      this.filtersForm.get('year')?.setValue(filters.year);
    }
    
    if (filters.genres && filters.genres.length > 0) {
      this.filtersForm.get('genres')?.setValue(filters.genres);
    }
    
    if (filters.voteAverageGte !== undefined) {
      this.filtersForm.get('voteAverageGte')?.setValue(filters.voteAverageGte);
    }
    
    if (filters.includeAdult !== undefined) {
      this.filtersForm.get('includeAdult')?.setValue(filters.includeAdult);
    }
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
  
  getGenreName(id: number): string {
    const genre = this.genres.find(g => g.id === id);
    return genre ? genre.name : '';
  }
  
  formatRating(value: number): string {
    return value.toString();
  }
  
  // Helpers para la interfaz
  compareGenres(genre1: number, genre2: number): boolean {
    return genre1 === genre2;
  }
}
