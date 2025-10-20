import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuth = this.authService.estaAutenticado();
    const isAdmin = this.authService.esAdmin();

    if (isAuth && isAdmin) return true;

    // redirige sin side-effects
    const target = isAuth ? ['/dashboard'] : ['/auth'];
    return this.router.createUrlTree(target, {
      queryParams: { returnUrl: state.url },
    });
  }
}
