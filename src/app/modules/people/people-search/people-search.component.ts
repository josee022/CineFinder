import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ApiService } from '../../../core/api.service';
import { Person } from '../../../core/models/person.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-people-search',
  templateUrl: './people-search.component.html',
  styleUrls: ['./people-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class PeopleSearchComponent implements OnInit {
  searchControl = new FormControl('');
  people: Person[] = [];
  featuredPeople: Person[] = [];
  secondaryPeople: Person[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Filtros
  filterDepartment: string = 'all'; // all, Acting, Directing, Writing, etc.
  showAll: boolean = false;
  peoplePage: number = 1;
  peoplePageSize: number = 25; // 5x5 grid

  
  // Paginación
  currentPage = 1;
  totalResults = 0;
  totalPages = 0;
  pageSize = 20;
  
  // Estado de búsqueda
  hasSearched = false;
  currentQuery = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupSearchListener();
  }

  setupSearchListener(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(value => value !== null && value.trim().length > 0)
    ).subscribe(value => {
      this.currentPage = 1;
      this.currentQuery = value!.trim();
      this.searchPeople();
    });
  }

  searchPeople(): void {
    if (!this.currentQuery) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    
    this.apiService.searchPeople(this.currentQuery, this.currentPage).subscribe({
      next: (response) => {
        this.people = response.results;
        this.totalResults = response.total_results;
        this.totalPages = response.total_pages;
        // Separar destacados y secundarios
        this.featuredPeople = this.people
          .filter(p => p.profile_path && p.popularity && p.popularity > 2)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        this.secondaryPeople = this.people
          .filter(p => !p.profile_path || !p.popularity || p.popularity <= 2);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al buscar personas. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error searching people:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.searchPeople();
    // Scroll al inicio de la lista
    window.scrollTo(0, 0);
  }

  navigateToPerson(id: number): void {
    this.router.navigate(['/people', id]);
  }

  getProfileUrl(profilePath: string | null): string {
    if (profilePath) {
      return `https://image.tmdb.org/t/p/w185${profilePath}`;
    }
    return 'assets/images/no-profile.png';
  }

  getKnownFor(person: Person): string {
    if (!person.known_for || person.known_for.length === 0) {
      return '';
    }
    return person.known_for
      .map(item => item.title ?? item.name ?? '')
      .filter(title => title)
      .slice(0, 3)
      .join(', ');
  }

  // Filtro por departamento
  setDepartmentFilter(dept: string) {
    this.filterDepartment = dept;
  }

  // Mostrar todos los resultados
  showAllResults() {
    this.showAll = true;
    this.peoplePage = 1;
  }

  showOnlyRelevants() {
    this.showAll = false;
    this.peoplePage = 1;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.people = [];
    this.featuredPeople = [];
    this.secondaryPeople = [];
    this.hasSearched = false;
    this.errorMessage = '';
    this.currentQuery = '';
    this.currentPage = 1;
    this.totalResults = 0;
    this.totalPages = 0;
    this.filterDepartment = 'all';
    this.showAll = false;
  }

  // Filtra personas según el departamento seleccionado
  filteredFeaturedPeople(): Person[] {
    if (this.filterDepartment === 'all') return this.featuredPeople;
    return this.featuredPeople.filter(p => p.known_for_department === this.filterDepartment);
  }

  filteredAllPeople(): Person[] {
    if (this.filterDepartment === 'all') return this.people;
    return this.people.filter(p => p.known_for_department === this.filterDepartment);
  }

  paginatedPeople(): Person[] {
    const start = (this.peoplePage - 1) * this.peoplePageSize;
    if (this.showAll) {
      return this.filteredAllPeople().slice(start, start + this.peoplePageSize);
    } else {
      return this.filteredFeaturedPeople().slice(start, start + this.peoplePageSize);
    }
  }

  get peopleTotalPages(): number {
    if (this.showAll) {
      return Math.ceil(this.filteredAllPeople().length / this.peoplePageSize) || 1;
    } else {
      return Math.ceil(this.filteredFeaturedPeople().length / this.peoplePageSize) || 1;
    }
  }

  goToPeoplePage(page: number) {
    this.peoplePage = page;
  }
}
