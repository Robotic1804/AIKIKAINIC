// auth.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Verificar si el usuario está autenticado
    if (this.authService.estaAutenticado()) {
      return true;
    }

    // Si no está autenticado, redirigir al login
    this.router.navigate(['/auth']);
    return false;
  }
}

// admin.guard.ts


// super-admin.guard.ts
@Injectable({
  providedIn: 'root',
})
export class SuperAdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Verificar si el usuario es super administrador
    if (this.authService.estaAutenticado() && this.authService.esSuperAdmin()) {
      return true;
    }

    // Si no es superadmin, redirigir al dashboard apropiado
    if (this.authService.esAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth']);
    }
    return false;
  }
}

// privilege.guard.ts - Guard para verificar privilegios específicos
@Injectable({
  providedIn: 'root',
})
export class PrivilegeGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: any
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Obtener el privilegio requerido desde los datos de la ruta
    const privilegioRequerido = route.data?.privilegio;

    if (!privilegioRequerido) {
      return true; // Si no se especifica privilegio, permitir acceso
    }

    // Verificar si el usuario tiene el privilegio requerido
    if (
      this.authService.esAdmin() &&
      this.authService.tienePrivilegio(privilegioRequerido)
    ) {
      return true;
    }

    // Mostrar mensaje de error y redirigir
    alert('No tienes los privilegios necesarios para acceder a esta sección');
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}

// no-auth.guard.ts - Guard para rutas que NO deben ser accesibles si está autenticado
@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Si NO está autenticado, permitir acceso
    if (!this.authService.estaAutenticado()) {
      return true;
    }

    // Si está autenticado, redirigir según el rol
    if (this.authService.esAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
    return false;
  }
}

// interceptor.service.ts - Interceptor para agregar token a las peticiones
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
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
              switchMap((respuesta) => {
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

// role.directive.ts - Directiva para mostrar/ocultar elementos según el rol
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input() appHasRole!: string | string[];
  private subscription?: Subscription;
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.subscription = this.authService.usuarioActual$.subscribe((usuario) => {
      this.updateView(usuario);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(usuario: any): void {
    const rolesPermitidos = Array.isArray(this.appHasRole)
      ? this.appHasRole
      : [this.appHasRole];

    if (usuario && rolesPermitidos.includes(usuario.rol)) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }
}

// privilege.directive.ts - Directiva para mostrar/ocultar elementos según privilegios
@Directive({
  selector: '[appHasPrivilege]',
  standalone: true,
})
export class HasPrivilegeDirective implements OnInit, OnDestroy {
  @Input() appHasPrivilege!: string;
  private subscription?: Subscription;
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.subscription = this.authService.usuarioActual$.subscribe((usuario) => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    if (this.authService.tienePrivilegio(this.appHasPrivilege)) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }
}
