import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export type Privilegio =
  | 'USERS_READ'
  | 'USERS_WRITE'
  | 'CONTENT_PUBLISH'
  | 'SETTINGS_EDIT'; // ajusta a tus claves

export const privilegeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) Lee el privilegio requerido desde la ruta
  //    Acepta string o string[]
  const required: Privilegio | Privilegio[] | undefined =
    route.data?.['privilegio'];

  // Si la ruta no exige privilegio, deja pasar
  if (!required) return true;

  const isAuth = auth.estaAutenticado();
  const isAdmin = auth.esAdmin();

  // 2) Normaliza a array
  const requiredList = Array.isArray(required) ? required : [required];

  // 3) Chequeo de privilegios (déjalo a tu service)
  const hasAll = isAdmin && requiredList.every((p) => auth.tienePrivilegio(p));

  if (isAuth && hasAll) return true;

  // 4) Construye redirección sin side-effects
  //    - Si está logueado pero le falta privilegio, llévalo al dashboard admin
  //    - Si no está logueado, a /auth
  const target = isAuth ? ['/admin/dashboard'] : ['/auth'];

  return router.createUrlTree(target, {
    queryParams: {
      denied: 'privilege',
      need: requiredList.join(','),
      returnUrl: state.url,
    },
  });
};
