// src/app/features/auth/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError} from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clona la solicitud original
  let authReq = req;

  // Obtiene el token
  const token = authService.obtenerToken();
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Envía la solicitud
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token expiró (401), intenta refrescarlo
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        return authService.refrescarToken().pipe(
          switchMap((refreshResponse: { token: string }) => {
            if (refreshResponse?.token) {
              // Use AuthService method instead of direct localStorage access
              authService.actualizarToken(refreshResponse.token);

              // Reintenta la solicitud original con el nuevo token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshResponse.token}`,
                },
              });
              return next(newReq);
            }

            // Si no se pudo refrescar, cierra sesión
            authService.cerrarSesion();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError(() => {
            // Si el refresh falla, cierra sesión
            authService.cerrarSesion();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      // Para otros errores (403, etc.), solo propaga el error
      return throwError(() => error);
    })
  );
};
