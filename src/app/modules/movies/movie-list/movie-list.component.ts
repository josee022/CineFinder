import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  movies: any[] = [];
  @ViewChild('movieContainer', { static: false }) movieContainer!: ElementRef;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTrendingMovies().subscribe((data) => {
      this.movies = data.results;
    });
  }
}
