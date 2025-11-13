import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Photo } from '../models/photo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private apiUrl = `${environment.apiUrl}/photos`;
  private baseUrl = environment.apiUrl.replace('/api', '');
  private http = inject(HttpClient);

  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.apiUrl).pipe(
      map((photos) =>
        photos.map((photo) => ({
          ...photo,
          imageUrl: `${this.baseUrl}${photo.imageUrl}`,
        }))
      ),
      catchError(this.handleError)
    );
  }

  createPhoto(photoData: FormData): Observable<Photo[]> {
    return this.http
      .post<{ message: string; data: Photo[] }>(this.apiUrl, photoData)
      .pipe(
        map((response) =>
          response.data.map((photo) => ({
            ...photo,
            imageUrl: `${this.baseUrl}${photo.imageUrl}`,
          }))
        ),
        catchError(this.handleError)
      );
  }

  deletePhoto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (error.status === 415) {
        errorMessage = 'Tipo de archivo no soportado';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
    }));
  }
}
