import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../models/user.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-email-verificado',
  templateUrl: './email-verificado.component.html',
  styleUrls: ['./email-verificado.component.css'],
})
export class EmailVerificadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  mensaje = signal('Verificando tu email...');
  cargando = signal(true);

  ngOnInit(): void {
    this.verificarToken();
  }

  private async verificarToken(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.mensaje.set('Token o email no proporcionados.');
      this.cargando.set(false);
      this.notificationService.error('Token o email no proporcionados');
      return;
    }

    try {
      // Create temporary user object with basic data
      const usuarioTemporal: Usuario = {
        id: '',
        name: '',
        email: email,
        role: 'user',
      };

      // Use proper AuthService method instead of direct localStorage access
      this.authService.guardarSesionDesdeVerificacion(token, usuarioTemporal);

      this.notificationService.success('¡Email verificado! Token guardado correctamente.');
      this.mensaje.set('¡Email verificado exitosamente! Iniciando sesión...');

      setTimeout(() => {
        // Redirect to home or dashboard
        this.router.navigate(['/']);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al verificar el token. Por favor, inicia sesión manualmente.';
      this.notificationService.error(errorMessage);
      this.mensaje.set(errorMessage);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } finally {
      this.cargando.set(false);
    }
  }
}
