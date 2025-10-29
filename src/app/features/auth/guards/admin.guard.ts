// src/app/features/auth/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const modalService = inject(ModalService);
  const router = inject(Router);

  const isAuth = authService.estaAutenticado();
  const isAdmin = authService.esAdmin(); // ← ya incluye 'webmaster'

  if (isAuth && isAdmin) {
    return true;
  }

  if (!isAuth) {
    modalService.abrirLoginModal();
    return false;
  }

  // Autenticado pero no admin → dashboard
  return router.createUrlTree(['/dashboard']);
};
