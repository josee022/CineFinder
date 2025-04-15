import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { KeywordResponse } from '../../../core/models/movie.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-movie-keywords',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './movie-keywords.component.html',
  styleUrls: ['./movie-keywords.component.scss']
})
export class MovieKeywordsComponent implements OnInit {
  @Input() keywords: KeywordResponse | undefined;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {}
  
  searchByKeyword(keywordId: number, keywordName: string): void {
    // Navegar a la búsqueda por palabra clave
    this.router.navigate(['/search'], { 
      queryParams: { 
        with_keywords: keywordId,
        keyword_name: keywordName 
      } 
    });
  }
  
  hasKeywords(): boolean {
    return !!(this.keywords?.keywords && this.keywords.keywords.length > 0);
  }
}
