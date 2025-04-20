import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../../core/api.service';
import { CountryProviders, Provider } from '../../../core/models/watch-provider.model';
import { WatchProvidersListResponse } from '../../../core/models/filters.model';

@Component({
  selector: 'app-watch-providers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatTabsModule,
    RouterModule
  ],
  templateUrl: './watch-providers.component.html',
  styleUrls: ['./watch-providers.component.scss']
})
export class WatchProvidersComponent implements OnInit {
  @Input() movieId!: number;
  
  isLoading = true;
  errorMessage = '';
  
  // Proveedores por país
  countryProviders: { countryCode: string, countryName: string, providers: CountryProviders }[] = [];
  
  // Nombres de países
  countryNames: { [code: string]: string } = {
    'ES': 'España',
    'US': 'Estados Unidos',
    'MX': 'México',
    'AR': 'Argentina',
    'CO': 'Colombia',
    'CL': 'Chile',
    'PE': 'Perú',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'CR': 'Costa Rica',
    'PA': 'Panamá',
    'DO': 'República Dominicana',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'SV': 'El Salvador',
    'CU': 'Cuba'
  };
  
  // Países prioritarios (se mostrarán primero)
  priorityCountries = ['ES', 'US', 'MX', 'AR', 'CO', 'CL'];
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    this.loadWatchProviders();
  }
  
  loadWatchProviders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getMovieWatchProviders(this.movieId).subscribe({
      next: (data) => {
        // data.results es un objeto con códigos de país como claves
        this.processWatchProviders(data.results);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'No se pudieron cargar los proveedores de streaming.';
        this.isLoading = false;
        console.error('Error cargando proveedores:', error);
      }
    });
  }
  
  processWatchProviders(results: any): void {
    // Convertir el objeto de resultados en un array
    const countries = Object.keys(results).map(countryCode => {
      // Asegurarse de que todos los campos del modelo estén presentes
      const providers: CountryProviders = {
        link: results[countryCode].link || '',
        flatrate: results[countryCode].flatrate || [],
        rent: results[countryCode].rent || [],
        buy: results[countryCode].buy || [],
        free: results[countryCode].free || [],
        ads: results[countryCode].ads || []
      };
      
      return {
        countryCode,
        countryName: this.getCountryName(countryCode),
        providers
      };
    });
    
    // Ordenar países: primero los prioritarios, luego el resto por nombre
    this.countryProviders = countries.sort((a, b) => {
      const aPriority = this.priorityCountries.indexOf(a.countryCode);
      const bPriority = this.priorityCountries.indexOf(b.countryCode);
      
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      } else if (aPriority !== -1) {
        return -1;
      } else if (bPriority !== -1) {
        return 1;
      } else {
        return a.countryName.localeCompare(b.countryName);
      }
    });
  }
  
  getCountryName(countryCode: string): string {
    return this.countryNames[countryCode] || countryCode;
  }
  
  getProviderLogoUrl(logoPath: string): string {
    return `https://image.tmdb.org/t/p/original${logoPath}`;
  }
  
  // Verificar si hay proveedores disponibles
  hasProviders(providers: CountryProviders): boolean {
    return !!(
      providers.flatrate?.length || 
      providers.rent?.length || 
      providers.buy?.length || 
      providers.free?.length ||
      providers.ads?.length
    );
  }
  
  // Obtener el número total de proveedores para un país
  getTotalProviders(providers: CountryProviders): number {
    let total = 0;
    if (providers.flatrate) total += providers.flatrate.length;
    if (providers.rent) total += providers.rent.length;
    if (providers.buy) total += providers.buy.length;
    if (providers.free) total += providers.free.length;
    if (providers.ads) total += providers.ads.length;
    return total;
  }
}
