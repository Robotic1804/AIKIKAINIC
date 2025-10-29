import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuarioActual();

  constructor() {
    // Redirección de seguridad (por si acceden directamente sin guard)
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/']);
    }
  }

  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}
