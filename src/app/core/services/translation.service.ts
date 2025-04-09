import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: any } = {};
  private currentLangSubject = new BehaviorSubject<Language>('es');
  public currentLang$ = this.currentLangSubject.asObservable();
  public onLangChange = new Subject<Language>();

  constructor(private http: HttpClient) {
    // Intentar cargar el idioma guardado en localStorage
    const savedLang = localStorage.getItem('cinefinder_language') as Language;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      this.setLanguage(savedLang);
    } else {
      this.loadTranslations('es').subscribe();
    }
  }

  /**
   * Cambia el idioma actual de la aplicación
   */
  setLanguage(lang: Language): void {
    localStorage.setItem('cinefinder_language', lang);
    this.currentLangSubject.next(lang);
    this.loadTranslations(lang).subscribe(() => {
      this.onLangChange.next(lang);
    });
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage(): Language {
    return this.currentLangSubject.getValue();
  }

  /**
   * Carga las traducciones para un idioma específico
   */
  private loadTranslations(lang: Language): Observable<any> {
    if (this.translations[lang]) {
      return of(this.translations[lang]); // Ya están cargadas
    }

    return this.http.get<any>(`assets/i18n/${lang}.json`)
      .pipe(
        tap(translations => {
          this.translations[lang] = translations;
        }),
        catchError(error => {
          console.error(`Error loading translations for ${lang}:`, error);
          return of({});
        })
      );
  }

  /**
   * Traduce una clave al idioma actual
   * Soporta claves anidadas con notación de punto (ej: 'common.search')
   * y sustitución de parámetros (ej: 'hello {{name}}')
   */
  translate(key: string, params: { [key: string]: string | number } = {}): string {
    const lang = this.getCurrentLanguage();
    if (!this.translations[lang]) {
      return key; // Si no hay traducciones cargadas, devolver la clave
    }

    const keys = key.split('.');
    let value = this.translations[lang];
    
    // Navegar por el objeto de traducciones siguiendo la ruta de claves
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Si no se encuentra la traducción, devolver la clave
      }
    }
    
    // Si el valor final es un string, aplicar sustituciones de parámetros
    if (typeof value === 'string') {
      return this.interpolateParams(value, params);
    }
    
    return key;
  }
  
  /**
   * Reemplaza los parámetros en un texto de traducción
   * Formato de parámetros: {{paramName}}
   */
  private interpolateParams(text: string, params: { [key: string]: string | number }): string {
    if (!params || !Object.keys(params).length) {
      return text;
    }
    
    return Object.keys(params).reduce((result, key) => {
      const value = params[key];
      return result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
    }, text);
  }
}
