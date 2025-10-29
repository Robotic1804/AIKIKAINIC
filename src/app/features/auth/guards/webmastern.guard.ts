// src/app/features/auth/guards/webmaster.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../../services/modal.service';

export const webmasterGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modalService = inject(ModalService);

  const isAuth = authService.estaAutenticado();
  const isWebmaster = authService.esWebmaster(); // ← Usa tu método existente
  const isAdmin = authService.esAdmin();

  if (isAuth && isWebmaster) {
    return true;
  }

  if (!isAuth) {
    
    modalService.abrirLoginModal();
    return false;
  }


  const target = isAdmin ? ['/admin/dashboard'] : ['/dashboard'];
  return router.createUrlTree(target);
};
