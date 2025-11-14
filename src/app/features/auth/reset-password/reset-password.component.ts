// reset-password.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  token = signal<string | null>(null);
  email = signal<string | null>(null); // ✅ NUEVO
  tokenValido = signal<boolean>(false);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);
  esObligatorio = signal<boolean>(false); // ✅ NUEVO

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    this.token.set(token);
    this.email.set(email);

    // ✅ NUEVO: Detectar si es cambio obligatorio
    this.esObligatorio.set(
      this.router.url.includes('cambiar-password-obligatorio')
    );

    if (!token) {
      this.error.set('Token no proporcionado.');
      this.cargando.set(false);
      return;
    }

    // Verificar token
    this.authService.verificarTokenReset(token).subscribe({
      next: () => {
        this.tokenValido.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.tokenValido.set(false);
        this.error.set('El enlace ha expirado o es inválido.');
        this.cargando.set(false);
      },
    });
  }

  passwordMatchValidator(g: any) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token()) return;

    const { password } = this.form.value;
    this.authService
      .resetPassword(this.token()!, { password: password! })
      .subscribe({
        next: () => {
          this.exito.set('¡Contraseña actualizada! Redirigiendo al login...');
          setTimeout(() => {
            this.router.navigate(['/inicio']).then(() => {
              // Open login modal after navigating to home
              setTimeout(() => this.modalService.abrirLoginModal(), 300);
            });
          }, 2000);
        },
        error: (err) => {
          this.error.set(
            'Error al actualizar la contraseña. Intenta nuevamente.'
          );
          // Error already displayed to user via error message
        },
      });
  }
}
