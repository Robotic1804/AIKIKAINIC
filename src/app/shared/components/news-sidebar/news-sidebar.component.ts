// shared/components/news-sidebar/news-sidebar.component.ts
import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NewsService } from '../../../services/news.service';
import { NewsCardComponent } from '../news-card/news-card.component';
import { News } from '../../../models/news.model';

@Component({
  selector: 'app-news-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NewsCardComponent],
  templateUrl: './news-sidebar.component.html',
  styleUrls: ['./news-sidebar.component.css'],
})
export class NewsSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private newsService = inject(NewsService);

  @Input() title: string = '📰 Últimas Noticias';
  @Input() limit: number = 5;
  @Input() showPinned: boolean = true;
  @Input() category?: string;

  newsList: News[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadNews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNews(): void {
    this.isLoading = true;

    const params: any = {
      limit: this.limit,
    };

    if (this.showPinned) {
      params.pinned = true;
    }

    if (this.category) {
      params.category = this.category;
    }

    this.newsService
      .getPublicNews(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.newsList = response.news;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          // Silent fail - sidebar is not critical
        },
      });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
