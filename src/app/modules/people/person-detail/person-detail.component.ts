import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { PersonDetails, MovieCredit, TVCredit, Image } from '../../../core/models/person.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule
  ]
})
export class PersonDetailComponent implements OnInit {
  personId!: number;
  person: PersonDetails | null = null;
  isLoading = true;
  errorMessage = '';
  movieCredits: MovieCredit[] = [];
  tvCredits: TVCredit[] = [];
  profileImages: Image[] = [];
  socialLinks: {icon: string, url: string, name: string}[] = [];

  constructor(private apiService: ApiService, private route: ActivatedRoute, public router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.personId = id;
        this.loadPersonDetails();
      } else {
        this.router.navigate(['/people']);
      }
    });
  }

  loadPersonDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getPersonDetails(this.personId).subscribe({
      next: (response) => {
        this.person = response;
        // Organizar créditos de películas por popularidad
        if (response.movie_credits?.cast) {
          this.movieCredits = [...response.movie_credits.cast]
            .sort((a, b) => b.popularity - a.popularity || new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());
        }

        // Organizar créditos de TV por popularidad
        if (response.tv_credits?.cast) {
          this.tvCredits = [...response.tv_credits.cast]
            .sort((a, b) => b.popularity - a.popularity || new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime());
        }

        // Obtener imágenes
        if (response.images?.profiles) {
          this.profileImages = [...response.images.profiles];
        }

        // Configurar enlaces de redes sociales
        this.setupSocialLinks();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading person details. Please try again.';
        this.isLoading = false;
        console.error('Error fetching person details:', error);
      }
    });
  }

  setupSocialLinks(): void {
    this.socialLinks = [];

    if (this.person?.external_ids) {
      const { imdb_id, facebook_id, instagram_id, twitter_id } = this.person.external_ids;

      if (imdb_id) {
        this.socialLinks.push({
          icon: 'movie',
          url: `https://www.imdb.com/name/${imdb_id}`,
          name: 'IMDb'
        });
      }

      if (facebook_id) {
        this.socialLinks.push({
          icon: 'facebook',
          url: `https://www.facebook.com/${facebook_id}`,
          name: 'Facebook'
        });
      }

      if (instagram_id) {
        this.socialLinks.push({
          icon: 'photo_camera',
          url: `https://www.instagram.com/${instagram_id}`,
          name: 'Instagram'
        });
      }

      if (twitter_id) {
        this.socialLinks.push({
          icon: 'tag',
          url: `https://twitter.com/${twitter_id}`,
          name: 'Twitter'
        });
      }
    }
  }

  getProfileUrl(size: string = 'h632'): string {
    if (this.person?.profile_path) {
      return `https://image.tmdb.org/t/p/${size}${this.person.profile_path}`;
    }
    return 'assets/placeholder-profile.jpg';
  }

  calculateAge(birthdate: string | null, deathdate: string | null = null): number | null {
    if (!birthdate) return null;

    const birth = new Date(birthdate);
    const end = deathdate ? new Date(deathdate) : new Date();

    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Desconocido';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getGender(genderCode: number): string {
    switch(genderCode) {
      case 1: return 'Femenino';
      case 2: return 'Masculino';
      default: return 'No especificado';
    }
  }

  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}
