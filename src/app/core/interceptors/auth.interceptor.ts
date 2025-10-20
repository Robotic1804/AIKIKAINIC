import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Obtener el token
    const token = this.authService.obtenerToken();

    // Si hay token, agregarlo a los headers
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Manejar la respuesta
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es error 401 (no autorizado)
        if (error.status === 401) {
          // Si no estamos refrescando el token
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            // Intentar refrescar el token
            return this.authService.refrescarToken().pipe(
              switchMap(() => {
                this.isRefreshing = false;

                // Reintentar la petición original con el nuevo token
                const newToken = this.authService.obtenerToken();
                if (newToken) {
                  const retryReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  });
                  return next.handle(retryReq);
                }

                return throwError(() => error);
              }),
              catchError((refreshError) => {
                this.isRefreshing = false;
                // Si falla el refresh, cerrar sesión
                this.authService.cerrarSesion();
                return throwError(() => refreshError);
              })
            );
          }
        }

        // Si es error 403 (prohibido)
        if (error.status === 403) {
          // Manejar acceso denegado
          console.error('Acceso denegado:', error);
        }

        return throwError(() => error);
      })
    );
  }
}
