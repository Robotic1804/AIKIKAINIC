// pages/noticias/noticia-detalle/noticia-detalle.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NewsService } from '../../../services/news.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import {
  News,
  NewsComment,
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORY_COLORS,
} from '../../../models/news.model';

@Component({
  selector: 'app-noticia-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NewsCardComponent],
  templateUrl: './noticia-detalle.component.html',
  styleUrls: ['./noticia-detalle.component.css'],
})
export class NoticiaDetalleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private newsService = inject(NewsService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // State
  news: News | null = null;
  relatedNews: News[] = [];
  comments: NewsComment[] = [];
  isLoading = false;
  isLoadingComments = false;
  hasLiked = false;

  // Comment form
  newComment = '';
  replyingTo: string | null = null;
  replyText = '';
  editingCommentId: string | null = null;
  editCommentText = '';

  // User
  currentUser$ = this.authService.usuarioActual$;
  currentUser: any = null;

  // Categories
  categoryLabels = NEWS_CATEGORY_LABELS;
  categoryColors = NEWS_CATEGORY_COLORS;

  ngOnInit(): void {
    // Get current user
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      this.currentUser = user;
      this.checkIfLiked();
    });

    // Get slug from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadNews(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNews(slug: string): void {
    this.isLoading = true;

    this.newsService
      .getNewsBySlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (news) => {
          this.news = news;
          this.isLoading = false;
          this.checkIfLiked();
          this.incrementViews();
          this.loadComments();
          this.loadRelatedNews();
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Noticia no encontrada');
          this.router.navigate(['/noticias']);
        },
      });
  }

  incrementViews(): void {
    if (!this.news?._id) return;

    this.newsService
      .incrementViews(this.news._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.news) {
            this.news.views = response.views;
          }
        },
        error: () => {
          // Silent fail
        },
      });
  }

  loadComments(): void {
    if (!this.news?._id) return;

    this.isLoadingComments = true;

    this.newsService
      .getComments(this.news._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.comments = response.comments;
          this.isLoadingComments = false;
        },
        error: () => {
          this.isLoadingComments = false;
          this.notificationService.error('Error al cargar los comentarios');
        },
      });
  }

  loadRelatedNews(): void {
    if (!this.news) return;

    const params = {
      category: this.news.category,
      limit: 3,
    };

    this.newsService
      .getPublicNews(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Filter out current news
          this.relatedNews = response.news.filter(
            (n) => n._id !== this.news?._id
          );
        },
        error: () => {
          // Silent fail
        },
      });
  }

  checkIfLiked(): void {
    if (!this.news || !this.currentUser) {
      this.hasLiked = false;
      return;
    }

    this.hasLiked = this.news.likes.includes(this.currentUser.id);
  }

  toggleLike(): void {
    if (!this.currentUser) {
      this.notificationService.error(
        'Debes iniciar sesión para dar me gusta'
      );
      return;
    }

    if (!this.news?._id) return;

    const action = this.hasLiked
      ? this.newsService.unlikeNews(this.news._id)
      : this.newsService.likeNews(this.news._id);

    action.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.news && this.currentUser) {
          // Update likes array manually
          if (this.hasLiked) {
            // Remove like
            this.news.likes = this.news.likes.filter(id => id !== this.currentUser.id);
          } else {
            // Add like
            this.news.likes = [...this.news.likes, this.currentUser.id];
          }
          this.hasLiked = !this.hasLiked;
        }
      },
      error: () => {
        this.notificationService.error('Error al procesar tu reacción');
      },
    });
  }

  submitComment(): void {
    if (!this.currentUser) {
      this.notificationService.error(
        'Debes iniciar sesión para comentar'
      );
      return;
    }

    if (!this.news?._id || !this.newComment.trim()) {
      this.notificationService.error('El comentario no puede estar vacío');
      return;
    }

    const commentData = {
      content: this.newComment.trim(),
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
    };

    this.newsService
      .createComment(this.news._id, commentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newComment = '';
          this.loadComments();
          this.notificationService.success('Comentario publicado');
        },
        error: () => {
          this.notificationService.error('Error al publicar el comentario');
        },
      });
  }

  startReply(commentId: string): void {
    this.replyingTo = commentId;
    this.replyText = '';
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyText = '';
  }

  submitReply(commentId: string): void {
    if (!this.currentUser) {
      this.notificationService.error('Debes iniciar sesión para responder');
      return;
    }

    if (!this.news?._id || !this.replyText.trim()) {
      this.notificationService.error('La respuesta no puede estar vacía');
      return;
    }

    const replyData = {
      content: this.replyText.trim(),
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
    };

    this.newsService
      .replyToComment(this.news._id, commentId, replyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.replyText = '';
          this.replyingTo = null;
          this.loadComments();
          this.notificationService.success('Respuesta publicada');
        },
        error: () => {
          this.notificationService.error('Error al publicar la respuesta');
        },
      });
  }

  startEditComment(comment: NewsComment): void {
    this.editingCommentId = comment._id || null;
    this.editCommentText = comment.content;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEditComment(commentId: string): void {
    if (!this.news?._id || !this.editCommentText.trim()) {
      this.notificationService.error('El comentario no puede estar vacío');
      return;
    }

    this.newsService
      .updateComment(this.news._id, commentId, this.editCommentText.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editingCommentId = null;
          this.editCommentText = '';
          this.loadComments();
          this.notificationService.success('Comentario actualizado');
        },
        error: () => {
          this.notificationService.error('Error al actualizar el comentario');
        },
      });
  }

  deleteComment(commentId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?'))
      return;

    if (!this.news?._id) return;

    this.newsService
      .deleteComment(this.news._id, commentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadComments();
          this.notificationService.success('Comentario eliminado');
        },
        error: () => {
          this.notificationService.error('Error al eliminar el comentario');
        },
      });
  }

  canEditComment(comment: NewsComment): boolean {
    if (!this.currentUser) return false;
    if (
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'webmaster'
    )
      return true;
    return comment.userEmail === this.currentUser.email;
  }

  canDeleteComment(comment: NewsComment): boolean {
    if (!this.currentUser) return false;
    if (
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'webmaster'
    )
      return true;
    return comment.userEmail === this.currentUser.email;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatShortDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  shareOnSocial(platform: string): void {
    if (!this.news) return;

    const url = window.location.href;
    const title = this.news.title;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.notificationService.success('Enlace copiado al portapapeles');
    });
  }
}
