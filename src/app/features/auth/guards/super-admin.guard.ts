import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const isAuth = this.authService.estaAutenticado();
    const isSuper = this.authService.esSuperAdmin();
    const isAdmin = this.authService.esAdmin();

    if (isAuth && isSuper) return true;

    // Redirecciones sin side-effects
    if (isAdmin) {
      return this.router.createUrlTree(['/admin/dashboard'], {
        queryParams: { returnUrl: state.url },
      });
    }
    if (isAuth) {
      return this.router.createUrlTree(['/dashboard'], {
        queryParams: { returnUrl: state.url },
      });
    }
    return this.router.createUrlTree(['/auth'], {
      queryParams: { returnUrl: state.url },
    });
  }
}
