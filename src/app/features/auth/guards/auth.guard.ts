// src/app/features/auth/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../../services/modal.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const modalService = inject(ModalService);

  if (authService.estaAutenticado()) {
    return true;
  }

 
  modalService.abrirLoginModal();
  return false;
};
