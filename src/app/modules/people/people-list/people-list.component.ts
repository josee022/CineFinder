import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { Person } from '../../../core/models/person.model';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class PeopleListComponent implements OnInit {
  people: Person[] = [];
  isLoading = true;
  errorMessage = '';
  currentPage = 1;
  totalResults = 0;
  totalPages = 0;
  pageSize = 20;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadPopularPeople();
  }

  loadPopularPeople(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getPopularPeople(this.currentPage).subscribe({
      next: (response) => {
        this.people = response.results;
        this.totalResults = response.total_results;
        this.totalPages = response.total_pages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading popular people. Please try again.';
        this.isLoading = false;
        console.error('Error fetching popular people:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadPopularPeople();
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
}
