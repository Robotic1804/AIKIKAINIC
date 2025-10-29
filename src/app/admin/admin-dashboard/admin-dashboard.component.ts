import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuarioActual();

  constructor() {
    // Redirección de seguridad (por si acceden directamente sin guard)
    if (!this.authService.esAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }
  irAGestionUsuarios(): void {
   this.router.navigate(['/webmaster/admins']);
  }
}
