import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verificar-email',
  imports: [CommonModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.css'
})
export class VerificarEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
 
  private authService = inject(AuthService);

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
        if (response.success) {
          this.exito.set(true);
          this.mensaje.set(response.message);
        } else {
          this.error.set(true);
          this.mensaje.set(response.message);
        }
      },
      error: (err) => {
        this.verificando.set(false);
        this.error.set(true);
        this.mensaje.set(err.error?.message || 'El token ha expirado o es inválido');
      }
    });
  }


}