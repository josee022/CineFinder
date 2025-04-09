import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appTranslate]',
  standalone: true
})
export class TranslateDirective implements OnInit, OnChanges, OnDestroy {
  @Input() appTranslate: string = '';
  @Input() translateParams: { [key: string]: string | number } = {};
  
  private langChangeSubscription: Subscription | null = null;

  constructor(
    private el: ElementRef,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Actualizar la traducción cuando cambie el idioma
    this.langChangeSubscription = this.translationService.currentLang$.subscribe(() => {
      this.updateTranslation();
    });
    
    // Traducción inicial
    this.updateTranslation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appTranslate'] || changes['translateParams']) {
      this.updateTranslation();
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private updateTranslation(): void {
    if (this.appTranslate) {
      const translatedText = this.translationService.translate(this.appTranslate, this.translateParams);
      this.el.nativeElement.textContent = translatedText;
    }
  }
}
