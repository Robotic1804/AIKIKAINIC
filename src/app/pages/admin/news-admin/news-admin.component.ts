// frontend/pages/admin/news-admin/news-admin.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NewsService } from '../../../services/news.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import {
  News,
  NewsStatus,
  NEWS_CATEGORY_LABELS,
  NEWS_STATUS_LABELS,
  NEWS_STATUS_COLORS,
  NEWS_CATEGORY_COLORS,
} from '../../../models/news.model';

@Component({
  selector: 'app-news-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-admin.component.html',
  styleUrls: ['./news-admin.component.css'],
})
export class NewsAdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private newsService = inject(NewsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // State
  newsList: News[] = [];
  isLoading = false;
  currentUser: any = null;
  isAdmin = false;
  isWebmaster = false;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  totalNews = 0;

  // Filters
  selectedStatus: NewsStatus | 'all' = 'all';

  // Labels
  categoryLabels = NEWS_CATEGORY_LABELS;
  statusLabels = NEWS_STATUS_LABELS;
  statusColors = NEWS_STATUS_COLORS;
  categoryColors = NEWS_CATEGORY_COLORS;
  NewsStatus = NewsStatus;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.authService.usuarioActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.isAdmin = this.authService.esAdmin();
          this.isWebmaster = this.authService.esWebmaster();
        }
      });
  }

  loadNews(): void {
    this.isLoading = true;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.selectedStatus !== 'all') {
      params.status = this.selectedStatus;
    }

    this.newsService
      .getAdminNews(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.newsList = response.news;
          this.totalPages = response.pagination.totalPages;
          this.totalNews = response.pagination.total;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(
            'Error al cargar noticias. Por favor, intenta de nuevo.'
          );
          console.error('Error loading news:', error);
        },
      });
  }

  canEditNews(news: News): boolean {
    if (!this.currentUser) return false;
    return this.newsService.canEditNews(
      news,
      this.currentUser.id,
      this.currentUser.role
    );
  }

  createNews(): void {
    this.router.navigate(['/admin/noticias/nueva']);
  }

  editNews(news: News): void {
    this.router.navigate(['/admin/noticias/editar', news._id]);
  }

  deleteNews(news: News): void {
    if (!this.canEditNews(news) || !news._id) {
      this.notificationService.warning(
        'No tienes permisos para eliminar esta noticia'
      );
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar "${news.title}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    this.newsService
      .deleteNews(news._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Noticia eliminada exitosamente');
          this.loadNews();
        },
        error: (error) => {
          if (error.status === 403) {
            this.notificationService.error(
              'No tienes permisos para eliminar esta noticia'
            );
          } else {
            this.notificationService.error(
              'Error al eliminar la noticia. Por favor, intenta de nuevo.'
            );
          }
        },
      });
  }

  publishNews(news: News): void {
    if (!this.canEditNews(news) || !news._id) {
      this.notificationService.warning(
        'No tienes permisos para publicar esta noticia'
      );
      return;
    }

    this.newsService
      .publishNews(news._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Noticia publicada exitosamente');
          this.loadNews();
        },
        error: (error) => {
          this.notificationService.error(
            'Error al publicar la noticia. Por favor, intenta de nuevo.'
          );
        },
      });
  }

  archiveNews(news: News): void {
    if (!this.canEditNews(news) || !news._id) {
      this.notificationService.warning(
        'No tienes permisos para archivar esta noticia'
      );
      return;
    }

    this.newsService
      .archiveNews(news._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Noticia archivada exitosamente');
          this.loadNews();
        },
        error: (error) => {
          this.notificationService.error(
            'Error al archivar la noticia. Por favor, intenta de nuevo.'
          );
        },
      });
  }

  filterByStatus(status: NewsStatus | 'all'): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadNews();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadNews();
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  viewNews(news: News): void {
    this.router.navigate(['/noticias', news.slug]);
  }

  viewNewsInNewTab(news: News): void {
    window.open(`/noticias/${news.slug}`, '_blank');
  }
}
