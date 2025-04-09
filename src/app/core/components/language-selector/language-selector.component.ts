import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService, Language } from '../../services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: Language = 'es';
  languages: LanguageOption[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  changeLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  getCurrentLanguageInfo(): LanguageOption | undefined {
    return this.languages.find(lang => lang.code === this.currentLang);
  }
}
