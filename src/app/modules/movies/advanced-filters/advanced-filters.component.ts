import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../../core/api.service';
import { FilterService } from '../../../core/services/filter.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { 
  MovieFilters, 
  SortOption, 
  WatchProvider, 
  Person 
} from '../../../core/models/filters.model';
import { Genre } from '../../../core/models/movie.model';

import { Subject, Observable, of, debounceTime, switchMap, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class AdvancedFiltersComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  
  // Datos para los selectores
  genres: Genre[] = [];
  watchProviders: WatchProvider[] = [];
  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popularity.desc', label: 'Popularidad (mayor a menor)' },
    { value: 'popularity.asc', label: 'Popularidad (menor a mayor)' },
    { value: 'vote_average.desc', label: 'Puntuación (mayor a menor)' },
    { value: 'vote_average.asc', label: 'Puntuación (menor a mayor)' },
    { value: 'release_date.desc', label: 'Fecha de estreno (reciente a antiguo)' },
    { value: 'release_date.asc', label: 'Fecha de estreno (antiguo a reciente)' },
    { value: 'revenue.desc', label: 'Recaudación (mayor a menor)' },
    { value: 'revenue.asc', label: 'Recaudación (menor a mayor)' }
  ];
  
  // Para búsqueda de actores y directores
  actorSearchResults: Person[] = [];
  directorSearchResults: Person[] = [];
  
  // Estado de carga
  isLoadingGenres = false;
  isLoadingProviders = false;
  isLoadingActors = false;
  isLoadingDirectors = false;
  
  // Para gestionar las suscripciones
  private destroy$ = new Subject<void>();
  private actorSearchTerms = new Subject<string>();
  private directorSearchTerms = new Subject<string>();
  
  // Años para el selector
  years: number[] = [];
  currentYear = new Date().getFullYear();
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private filterService: FilterService,
    private scrollService: ScrollService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Generar lista de años desde 1900 hasta el año actual
    for (let year = this.currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
    
    // Inicializar formulario
    this.filterForm = this.fb.group({
      query: [''],
      year: [null],
      genres: [[]],
      sortBy: ['popularity.desc'],
      includeAdult: [false],
      voteAverageGte: [0],
      withCast: [''],
      withCrew: [''],
      selectedActors: [[]],
      selectedDirectors: [[]],
      withWatchProviders: [[]]
    });
  }

  ngOnInit(): void {
    // Cargar datos iniciales
    this.loadGenres();
    this.loadWatchProviders();
    
    // Configurar búsqueda de actores con debounce
    this.actorSearchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      switchMap(term => {
        if (term.length < 2) return of([]);
        this.isLoadingActors = true;
        return this.apiService.searchPerson(term).pipe(
          map(response => {
            // Filtrar solo actores
            return response.results.filter(person => 
              person.known_for_department === 'Acting'
            ).slice(0, 5);
          })
        );
      })
    ).subscribe({
      next: results => {
        this.actorSearchResults = results;
        this.isLoadingActors = false;
      },
      error: error => {
        console.error('Error al buscar actores:', error);
        this.isLoadingActors = false;
      }
    });
    
    // Configurar búsqueda de directores con debounce
    this.directorSearchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      switchMap(term => {
        if (term.length < 2) return of([]);
        this.isLoadingDirectors = true;
        return this.apiService.searchPerson(term).pipe(
          map(response => {
            // Filtrar solo directores
            return response.results.filter(person => 
              person.known_for_department === 'Directing'
            ).slice(0, 5);
          })
        );
      })
    ).subscribe({
      next: results => {
        this.directorSearchResults = results;
        this.isLoadingDirectors = false;
      },
      error: error => {
        console.error('Error al buscar directores:', error);
        this.isLoadingDirectors = false;
      }
    });
    
    // Cargar filtros guardados
    this.filterService.getFilters().pipe(
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      // Actualizar formulario con filtros guardados
      if (filters) {
        this.filterForm.patchValue({
          query: filters.query || '',
          year: filters.year || null,
          genres: filters.genres || [],
          sortBy: filters.sortBy || 'popularity.desc',
          includeAdult: filters.includeAdult || false,
          voteAverageGte: filters.voteAverageGte || 0,
          withWatchProviders: filters.withWatchProviders || []
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadGenres(): void {
    this.isLoadingGenres = true;
    this.apiService.getGenres().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.genres = response.genres;
        this.isLoadingGenres = false;
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
        this.isLoadingGenres = false;
      }
    });
  }
  
  loadWatchProviders(): void {
    this.isLoadingProviders = true;
    this.apiService.getWatchProvidersList().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.watchProviders = response.results;
        this.isLoadingProviders = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores de streaming:', error);
        this.isLoadingProviders = false;
      }
    });
  }
  
  // Métodos para búsqueda de actores y directores
  searchActors(term: string): void {
    this.actorSearchTerms.next(term);
  }
  
  searchDirectors(term: string): void {
    this.directorSearchTerms.next(term);
  }
  
  // Añadir actor seleccionado
  addActor(actor: Person): void {
    const selectedActors = this.filterForm.get('selectedActors')?.value || [];
    if (!selectedActors.some((a: Person) => a.id === actor.id)) {
      this.filterForm.patchValue({
        selectedActors: [...selectedActors, actor],
        withCast: ''  // Limpiar campo de búsqueda
      });
    }
    this.actorSearchResults = [];
  }
  
  // Añadir director seleccionado
  addDirector(director: Person): void {
    const selectedDirectors = this.filterForm.get('selectedDirectors')?.value || [];
    if (!selectedDirectors.some((d: Person) => d.id === director.id)) {
      this.filterForm.patchValue({
        selectedDirectors: [...selectedDirectors, director],
        withCrew: ''  // Limpiar campo de búsqueda
      });
    }
    this.directorSearchResults = [];
  }
  
  // Eliminar actor
  removeActor(actor: Person): void {
    const selectedActors = this.filterForm.get('selectedActors')?.value || [];
    this.filterForm.patchValue({
      selectedActors: selectedActors.filter((a: Person) => a.id !== actor.id)
    });
  }
  
  // Eliminar director
  removeDirector(director: Person): void {
    const selectedDirectors = this.filterForm.get('selectedDirectors')?.value || [];
    this.filterForm.patchValue({
      selectedDirectors: selectedDirectors.filter((d: Person) => d.id !== director.id)
    });
  }
  
  // Aplicar filtros
  applyFilters(): void {
    const formValues = this.filterForm.value;
    
    // Construir objeto de filtros
    const filters: MovieFilters = {
      query: formValues.query || undefined,
      year: formValues.year || undefined,
      genres: formValues.genres || undefined,
      sortBy: formValues.sortBy,
      includeAdult: formValues.includeAdult,
      voteAverageGte: formValues.voteAverageGte > 0 ? formValues.voteAverageGte : undefined,
      withWatchProviders: formValues.withWatchProviders || undefined
    };
    
    // Añadir IDs de actores si hay seleccionados
    if (formValues.selectedActors && formValues.selectedActors.length > 0) {
      filters.withCast = formValues.selectedActors.map((actor: Person) => actor.id).join(',');
    }
    
    // Añadir IDs de directores si hay seleccionados
    if (formValues.selectedDirectors && formValues.selectedDirectors.length > 0) {
      filters.withCrew = formValues.selectedDirectors.map((director: Person) => director.id).join(',');
    }
    
    // Guardar filtros en el servicio
    this.filterService.updateFilters(filters);
    
    // Navegar a la página de resultados
    this.router.navigate(['/movies/discover'], {
      queryParams: { page: 1 }
    }).then(() => {
      this.scrollService.scrollToTop();
    });
  }
  
  // Restablecer filtros
  resetFilters(): void {
    this.filterForm.reset({
      query: '',
      year: null,
      genres: [],
      sortBy: 'popularity.desc',
      includeAdult: false,
      voteAverageGte: 0,
      withCast: '',
      withCrew: '',
      selectedActors: [],
      selectedDirectors: [],
      withWatchProviders: []
    });
    
    this.filterService.resetFilters();
  }
  
  // Obtener URL de imagen de perfil
  getProfileImageUrl(path: string | null): string {
    if (!path) return 'assets/images/no-profile.png';
    return `https://image.tmdb.org/t/p/w92${path}`;
  }
  
  // Obtener URL de logo de proveedor
  getProviderLogoUrl(path: string): string {
    return `https://image.tmdb.org/t/p/original${path}`;
  }
}
