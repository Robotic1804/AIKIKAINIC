// shared/components/news-card/news-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  News,
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORY_COLORS,
} from '../../../models/news.model';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.css'],
})
export class NewsCardComponent {
  @Input({ required: true }) news!: News;
  @Input() showExcerpt: boolean = true;
  @Input() showStats: boolean = true;
  @Input() compact: boolean = false; // For sidebar

  categoryLabels = NEWS_CATEGORY_LABELS;
  categoryColors = NEWS_CATEGORY_COLORS;

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
