// frontend/services/news.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  News,
  NewsListResponse,
  NewsStatsResponse,
  CommentsResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
  CreateCommentRequest,
  CreateReplyRequest,
  NewsCategory,
  NewsStatus,
} from '../models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;
  private http = inject(HttpClient);

  // ==========================================
  // NOTICIAS - CRUD
  // ==========================================

  /**
   * Obtener noticias públicas con filtros y paginación
   */
  getPublicNews(params?: {
    page?: number;
    limit?: number;
    category?: NewsCategory;
    tag?: string;
    search?: string;
    pinned?: boolean;
  }): Observable<NewsListResponse> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.tag) httpParams = httpParams.set('tag', params.tag);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.pinned !== undefined) httpParams = httpParams.set('pinned', params.pinned.toString());

    return this.http.get<NewsListResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Obtener todas las noticias (admin)
   */
  getAdminNews(params?: {
    page?: number;
    limit?: number;
    status?: NewsStatus;
    authorId?: string;
  }): Observable<NewsListResponse> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.authorId) httpParams = httpParams.set('authorId', params.authorId);

    return this.http.get<NewsListResponse>(`${this.apiUrl}/admin/list`, {
      params: httpParams,
    });
  }

  /**
   * Obtener una noticia por slug
   */
  getNewsBySlug(slug: string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${slug}`);
  }

  /**
   * Crear una nueva noticia (admin/webmaster)
   */
  createNews(data: CreateNewsRequest): Observable<News> {
    return this.http.post<News>(this.apiUrl, data);
  }

  /**
   * Actualizar una noticia (admin creador/webmaster)
   */
  updateNews(id: string, data: UpdateNewsRequest): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar una noticia (soft delete)
   */
  deleteNews(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Publicar una noticia borrador
   */
  publishNews(id: string): Observable<{ message: string; news: News }> {
    return this.http.patch<{ message: string; news: News }>(
      `${this.apiUrl}/${id}/publish`,
      {}
    );
  }

  /**
   * Archivar una noticia
   */
  archiveNews(id: string): Observable<{ message: string; news: News }> {
    return this.http.patch<{ message: string; news: News }>(
      `${this.apiUrl}/${id}/archive`,
      {}
    );
  }

  // ==========================================
  // ENGAGEMENT
  // ==========================================

  /**
   * Dar like a una noticia
   */
  likeNews(id: string): Observable<{ message: string; likesCount: number }> {
    return this.http.post<{ message: string; likesCount: number }>(
      `${this.apiUrl}/${id}/like`,
      {}
    );
  }

  /**
   * Quitar like de una noticia
   */
  unlikeNews(id: string): Observable<{ message: string; likesCount: number }> {
    return this.http.delete<{ message: string; likesCount: number }>(
      `${this.apiUrl}/${id}/like`
    );
  }

  /**
   * Incrementar vistas de una noticia
   */
  incrementViews(id: string): Observable<{ views: number }> {
    return this.http.post<{ views: number }>(`${this.apiUrl}/${id}/view`, {});
  }

  // ==========================================
  // COMENTARIOS
  // ==========================================

  /**
   * Obtener comentarios de una noticia
   */
  getComments(newsId: string): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.apiUrl}/${newsId}/comments`);
  }

  /**
   * Crear un comentario
   */
  createComment(
    newsId: string,
    data: CreateCommentRequest
  ): Observable<{ message: string; comment: any }> {
    return this.http.post<{ message: string; comment: any }>(
      `${this.apiUrl}/${newsId}/comments`,
      data
    );
  }

  /**
   * Editar un comentario
   */
  updateComment(
    newsId: string,
    commentId: string,
    content: string
  ): Observable<{ message: string; comment: any }> {
    return this.http.put<{ message: string; comment: any }>(
      `${this.apiUrl}/${newsId}/comments/${commentId}`,
      { content }
    );
  }

  /**
   * Eliminar un comentario
   */
  deleteComment(
    newsId: string,
    commentId: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${newsId}/comments/${commentId}`
    );
  }

  /**
   * Responder a un comentario
   */
  replyToComment(
    newsId: string,
    commentId: string,
    data: CreateReplyRequest
  ): Observable<{ message: string; reply: any }> {
    return this.http.post<{ message: string; reply: any }>(
      `${this.apiUrl}/${newsId}/comments/${commentId}/reply`,
      data
    );
  }

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  /**
   * Obtener estadísticas generales (admin)
   */
  getStats(): Observable<NewsStatsResponse> {
    return this.http.get<NewsStatsResponse>(`${this.apiUrl}/admin/stats`);
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Verifica si el usuario actual puede editar/eliminar una noticia
   */
  canEditNews(news: News, userId: string, userRole: string): boolean {
    if (userRole === 'webmaster') return true;
    if (userRole === 'admin' && news.authorId === userId) return true;
    return false;
  }

  /**
   * Verifica si el usuario actual puede eliminar un comentario
   */
  canDeleteComment(
    comment: any,
    userId: string,
    userRole: string
  ): boolean {
    // El autor del comentario, admin o webmaster pueden eliminar
    if (comment.userId === userId) return true;
    if (userRole === 'admin' || userRole === 'webmaster') return true;
    return false;
  }
}
