import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../../core/api.service';
import { FilterService } from '../../../core/services/filter.service';
import { ScrollService } from '../../../core/services/scroll.service';
import { DateService } from '../../../core/services/date.service';
import { Movie } from '../../../core/models/movie.model';

import { Subject, takeUntil } from 'rxjs';

interface CalendarDay {
  date: Date;
  movies: Movie[];
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-release-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './release-calendar.component.html',
  styleUrls: ['./release-calendar.component.scss']
})
export class ReleaseCalendarComponent implements OnInit, OnDestroy {
  calendarDays: CalendarDay[] = [];
  calendarWeeks: CalendarDay[][] = [];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  monthName: string = '';
  weekDays: string[] = [];
  
  isLoading = true;
  errorMessage = '';
  allMovies: Movie[] = [];
  
  // Para gestionar suscripciones
  private destroy$ = new Subject<void>();
  
  constructor(
    private apiService: ApiService,
    private filterService: FilterService,
    private scrollService: ScrollService,
    private dateService: DateService
  ) {
    // Inicializar días de la semana
    this.weekDays = Array(7).fill(0).map((_, i) => this.dateService.getDayName(i, true));
  }

  ngOnInit(): void {
    this.loadCalendarData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadCalendarData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.scrollService.scrollToTop();
    
    // Actualizar nombre del mes
    this.monthName = `${this.dateService.getMonthName(this.currentMonth)} ${this.currentYear}`;
    
    // Obtener rango de fechas para el mes actual
    const { startDate, endDate } = this.dateService.getMonthDateRange(this.currentYear, this.currentMonth);
    
    // Obtener estrenos para el mes actual
    this.apiService.getUpcomingReleases(startDate, endDate).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.allMovies = response.results;
        this.generateCalendar();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el calendario de estrenos. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error cargando estrenos:', error);
      }
    });
  }
  
  generateCalendar(): void {
    this.calendarDays = [];
    
    // Obtener el primer día del mes (0 = domingo, 1 = lunes, etc.)
    const firstDayOfMonth = this.dateService.getFirstDayOfMonth(this.currentYear, this.currentMonth);
    
    // Obtener el número de días en el mes
    const daysInMonth = this.dateService.getDaysInMonth(this.currentYear, this.currentMonth);
    
    // Obtener el último día del mes anterior
    const daysInPrevMonth = this.dateService.getDaysInMonth(
      this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear,
      this.currentMonth === 0 ? 11 : this.currentMonth - 1
    );
    
    // Añadir días del mes anterior para completar la primera semana
    for (let i = 0; i < firstDayOfMonth; i++) {
      const date = new Date(
        this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear,
        this.currentMonth === 0 ? 11 : this.currentMonth - 1,
        daysInPrevMonth - firstDayOfMonth + i + 1
      );
      
      this.calendarDays.push({
        date,
        movies: [],
        isToday: this.dateService.isToday(date),
        isPast: this.dateService.isPastDate(date),
        isCurrentMonth: false
      });
    }
    
    // Añadir días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      
      // Filtrar películas para este día
      const dayMovies = this.allMovies.filter(movie => {
        if (!movie.release_date) return false;
        
        const releaseDate = new Date(movie.release_date);
        return releaseDate.getDate() === date.getDate() &&
               releaseDate.getMonth() === date.getMonth() &&
               releaseDate.getFullYear() === date.getFullYear();
      });
      
      this.calendarDays.push({
        date,
        movies: dayMovies,
        isToday: this.dateService.isToday(date),
        isPast: this.dateService.isPastDate(date),
        isCurrentMonth: true
      });
    }
    
    // Añadir días del mes siguiente para completar la última semana
    const remainingDays = 42 - this.calendarDays.length; // 6 semanas * 7 días = 42
    
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(
        this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear,
        this.currentMonth === 11 ? 0 : this.currentMonth + 1,
        i
      );
      
      this.calendarDays.push({
        date,
        movies: [],
        isToday: this.dateService.isToday(date),
        isPast: this.dateService.isPastDate(date),
        isCurrentMonth: false
      });
    }
    
    // Dividir los días en semanas
    this.calendarWeeks = [];
    for (let i = 0; i < this.calendarDays.length; i += 7) {
      this.calendarWeeks.push(this.calendarDays.slice(i, i + 7));
    }
  }
  
  // Navegar al mes anterior
  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadCalendarData();
  }
  
  // Navegar al mes siguiente
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendarData();
  }
  
  // Navegar al mes actual
  goToCurrentMonth(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.loadCalendarData();
  }
  
  // Obtener URL de póster
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) return 'assets/images/no-poster.png';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  }
  
  // Formatear fecha
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  // Obtener número de películas para un día
  getMovieCount(day: CalendarDay): number {
    return day.movies.length;
  }
  
  // Comprobar si hay películas en un día
  hasMovies(day: CalendarDay): boolean {
    return day.movies.length > 0;
  }
}
