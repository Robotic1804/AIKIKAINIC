// auth.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-menu.component.html',
  styleUrls: ['./auth-menu.component.css'],
})
export class AuthComponent implements OnInit {
  // Estados de la interfaz
  mostrarOpciones = false;
  opcionSeleccionada: 'registro' | 'login' | 'admin' | null = null;

  // Formularios
  registroForm!: FormGroup;
  loginForm!: FormGroup;
  adminForm!: FormGroup;

  // Control de errores y carga
  mensajeError = '';
  mensajeExito = '';
  cargando = false;

  // Animaciones
  animacionActiva = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    // Verificar si ya hay una sesión activa
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  inicializarFormularios(): void {
    // Formulario de registro
    this.registroForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmarPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Formulario de login de usuario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Formulario de login de administrador
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      codigo2FA: [''], // Opcional: para mayor seguridad
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmarPassword = form.get('confirmarPassword');

    if (
      password &&
      confirmarPassword &&
      password.value !== confirmarPassword.value
    ) {
      confirmarPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmarPassword?.setErrors(null);
    }
    return null;
  }

  // Mostrar las opciones al hacer clic en "Ingresar"
  mostrarOpcionesIngreso(): void {
    this.animacionActiva = true;
    setTimeout(() => {
      this.mostrarOpciones = true;
      this.animacionActiva = false;
    }, 300);
  }

  // Seleccionar una opción
  seleccionarOpcion(opcion: 'registro' | 'login' | 'admin'): void {
    this.opcionSeleccionada = opcion;
    this.limpiarMensajes();

    // Resetear formularios
    this.registroForm.reset();
    this.loginForm.reset();
    this.adminForm.reset();
  }

  // Volver al menú de opciones
  volverAOpciones(): void {
    this.opcionSeleccionada = null;
    this.limpiarMensajes();
  }

  // Volver al inicio
  volverInicio(): void {
    this.mostrarOpciones = false;
    this.opcionSeleccionada = null;
    this.limpiarMensajes();
  }

  // Registro de usuario
  async registrar(): Promise<void> {
    if (this.registroForm.valid) {
      this.cargando = true;
      this.limpiarMensajes();

      try {
        const { confirmarPassword: _confirmarPassword, ...datosRegistro } = this.registroForm.value;
        // confirmarPassword is intentionally excluded from datosRegistro
        await this.authService
          .registrar(datosRegistro)
          .toPromise();

        this.mensajeExito = '¡Registro exitoso! Redirigiendo...';

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      } catch (error: unknown) {
        this.mensajeError =
          (error as { error?: { mensaje?: string } }).error?.mensaje || 'Error al registrar usuario';
      } finally {
        this.cargando = false;
      }
    } else {
      this.marcarCamposInvalidos(this.registroForm);
    }
  }

  // Login de usuario normal
  async loginUsuario(): Promise<void> {
    if (this.loginForm.valid) {
      this.cargando = true;
      this.limpiarMensajes();

      try {
        await this.authService
          .login(this.loginForm.value)
          .toPromise();

        this.mensajeExito = '¡Login exitoso! Redirigiendo...';

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } catch (error: unknown) {
        this.mensajeError = (error as { error?: { mensaje?: string } }).error?.mensaje || 'Credenciales inválidas';
      } finally {
        this.cargando = false;
      }
    } else {
      this.marcarCamposInvalidos(this.loginForm);
    }
  }

  // Login de administrador
  async loginAdmin(): Promise<void> {
    if (this.adminForm.valid) {
      this.cargando = true;
      this.limpiarMensajes();

      try {
        await this.authService
          .loginAdmin(this.adminForm.value)
          .toPromise();

        this.mensajeExito = '¡Acceso de administrador concedido!';

        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1500);
      } catch (error: unknown) {
        this.mensajeError =
          (error as { error?: { mensaje?: string } }).error?.mensaje || 'Credenciales de administrador inválidas';
      } finally {
        this.cargando = false;
      }
    } else {
      this.marcarCamposInvalidos(this.adminForm);
    }
  }

  // Utilidades
  marcarCamposInvalidos(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  // Getters para validación en el template
  get nombreInvalido(): boolean {
    const campo = this.registroForm.get('nombre');
    return !!(campo?.invalid && campo?.touched);
  }

  get emailRegistroInvalido(): boolean {
    const campo = this.registroForm.get('email');
    return !!(campo?.invalid && campo?.touched);
  }

  get passwordRegistroInvalido(): boolean {
    const campo = this.registroForm.get('password');
    return !!(campo?.invalid && campo?.touched);
  }

  get confirmarPasswordInvalido(): boolean {
    const campo = this.registroForm.get('confirmarPassword');
    return !!(campo?.invalid && campo?.touched);
  }

  get emailLoginInvalido(): boolean {
    const campo = this.loginForm.get('email');
    return !!(campo?.invalid && campo?.touched);
  }

  get passwordLoginInvalido(): boolean {
    const campo = this.loginForm.get('password');
    return !!(campo?.invalid && campo?.touched);
  }

  get emailAdminInvalido(): boolean {
    const campo = this.adminForm.get('email');
    return !!(campo?.invalid && campo?.touched);
  }

  get passwordAdminInvalido(): boolean {
    const campo = this.adminForm.get('password');
    return !!(campo?.invalid && campo?.touched);
  }
}
