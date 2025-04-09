import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  
  /**
   * Formatea una fecha en formato YYYY-MM-DD para la API
   */
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Obtiene el rango de fechas para un mes específico
   */
  getMonthDateRange(year: number, month: number): { startDate: string, endDate: string } {
    // El mes en JavaScript es 0-indexed (0 = enero, 11 = diciembre)
    const startDate = new Date(year, month, 1);
    // El día 0 del siguiente mes es el último día del mes actual
    const endDate = new Date(year, month + 1, 0);
    
    return {
      startDate: this.formatDateForApi(startDate),
      endDate: this.formatDateForApi(endDate)
    };
  }
  
  /**
   * Obtiene el rango de fechas para un período específico a partir de hoy
   */
  getDateRangeFromToday(months: number): { startDate: string, endDate: string } {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + months);
    
    return {
      startDate: this.formatDateForApi(today),
      endDate: this.formatDateForApi(endDate)
    };
  }
  
  /**
   * Obtiene el nombre del mes en español
   */
  getMonthName(month: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month];
  }
  
  /**
   * Obtiene el nombre del día de la semana en español
   */
  getDayName(day: number, short: boolean = false): string {
    const longDayNames = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];
    const shortDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return short ? shortDayNames[day] : longDayNames[day];
  }
  
  /**
   * Comprueba si una fecha es hoy
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  /**
   * Comprueba si una fecha está en el pasado
   */
  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }
  
  /**
   * Obtiene el número de días en un mes
   */
  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  /**
   * Obtiene el primer día de la semana de un mes (0 = domingo, 1 = lunes, etc.)
   */
  getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }
}
