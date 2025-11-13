// verificar-email.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verificar-email',
  imports: [CommonModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.css',
})
export class VerificarEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  verificando = signal(true);
  exito = signal(false);
  error = signal(false);
  mensaje = signal('');
  anioActual = new Date().getFullYear();

  ngOnInit() {
    const token = this.route.snapshot.params['token'];
    if (token) {
      this.verificarEmail(token);
    } else {
      this.error.set(true);
      this.verificando.set(false);
      this.mensaje.set('Token no proporcionado');
    }
  }

  verificarEmail(token: string) {
    this.authService.verificarEmail(token).subscribe({
      next: (response) => {
        this.verificando.set(false);
        this.exito.set(true);
        this.mensaje.set(response.mensaje || '¡Email verificado exitosamente!');

        // Redirigir después de un breve tiempo
        setTimeout(() => {
          const usuario = this.authService.obtenerUsuarioActual();
          if (usuario) {
            const url =
              usuario.role === 'admin' || usuario.role === 'webmaster'
                ? '/admin/dashboard'
                : '/dashboard';
            this.router.navigate([url]);
          } else {
            this.router.navigate(['/login']);
          }
        }, 2000);
      },
      error: (err) => {
        this.verificando.set(false);
        this.error.set(true);
        this.mensaje.set(
          err.error?.mensaje ||
            err.error?.message ||
            'El token ha expirado o es inválido'
        );
      },
    });
  }
}
