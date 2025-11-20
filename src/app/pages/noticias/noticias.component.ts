// pages/noticias/noticias.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NewsService } from '../../services/news.service';
import { NotificationService } from '../../services/notification.service';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import {
  News,
  NewsCategory,
  NEWS_CATEGORY_LABELS,
} from '../../models/news.model';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsCardComponent],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css'],
})
export class NoticiasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private newsService = inject(NewsService);
  private notificationService = inject(NotificationService);

  // State
  newsList: News[] = [];
  pinnedNews: News[] = [];
  isLoading = false;

  // Filters
  selectedCategory: NewsCategory | 'all' = 'all';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 9; // 3x3 grid
  totalPages = 0;
  totalNews = 0;

  // Categories
  NewsCategory = NewsCategory;
  categories = Object.values(NewsCategory);
  categoryLabels = NEWS_CATEGORY_LABELS;

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
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.selectedCategory !== 'all') {
      params.category = this.selectedCategory;
    }

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    // Load pinned news separately (only on first page without filters)
    if (
      this.currentPage === 1 &&
      this.selectedCategory === 'all' &&
      !this.searchTerm.trim()
    ) {
      this.newsService
        .getPublicNews({ pinned: true, limit: 3 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.pinnedNews = response.news;
          },
          error: () => {
            // Silent fail for pinned news
          },
        });
    } else {
      this.pinnedNews = [];
    }

    this.newsService
      .getPublicNews(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.newsList = response.news;
          this.totalPages = response.pagination.totalPages;
          this.totalNews = response.pagination.total;
          this.isLoading = false;

          // Scroll to top on page change
          if (this.currentPage > 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error(
            'Error al cargar las noticias. Por favor, intenta de nuevo.'
          );
        },
      });
  }

  filterByCategory(category: NewsCategory | 'all'): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadNews();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadNews();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadNews();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadNews();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
