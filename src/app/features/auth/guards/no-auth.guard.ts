import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si NO está autenticado, permitir acceso a /auth (login/registro)
  if (!auth.estaAutenticado()) return true;

  // Si sí está autenticado, redirigir según rol
  const target = auth.esAdmin() ? ['/admin/dashboard'] : ['/dashboard'];
  return router.createUrlTree(target, {
    queryParams: { returnUrl: state.url },
  });
};
0