import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MovieFilters, SortOption } from '../models/filters.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private defaultFilters: MovieFilters = {
    sortBy: 'popularity.desc',
    includeAdult: false
  };

  private filtersSubject = new BehaviorSubject<MovieFilters>(this.defaultFilters);
  
  constructor() {
    // Intentar recuperar filtros guardados del localStorage
    const savedFilters = localStorage.getItem('movie-filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        this.filtersSubject.next({...this.defaultFilters, ...parsedFilters});
      } catch (e) {
        console.error('Error al cargar filtros guardados:', e);
      }
    }
  }

  getFilters(): Observable<MovieFilters> {
    return this.filtersSubject.asObservable();
  }

  getCurrentFilters(): MovieFilters {
    return this.filtersSubject.getValue();
  }

  updateFilters(filters: Partial<MovieFilters>): void {
    const currentFilters = this.filtersSubject.getValue();
    const newFilters = { ...currentFilters, ...filters };
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('movie-filters', JSON.stringify(newFilters));
    
    this.filtersSubject.next(newFilters);
  }

  resetFilters(): void {
    localStorage.removeItem('movie-filters');
    this.filtersSubject.next(this.defaultFilters);
  }

  // Métodos de utilidad para trabajar con fechas
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  // Obtener rango de fechas para el calendario de estrenos
  getUpcomingDateRange(months: number = 3): { startDate: string, endDate: string } {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + months);
    
    return {
      startDate: this.formatDateForApi(today),
      endDate: this.formatDateForApi(endDate)
    };
  }
}
