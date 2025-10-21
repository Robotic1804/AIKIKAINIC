// auth.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// Tipos personalizados
type OpcionAuth = 'registro' | 'login' | 'admin' | null;

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

interface DatosLogin {
  email: string;
  password: string;
}

interface DatosLoginAdmin {
  email: string;
  password: string;
  codigo2FA?: string;
}

interface ErrorResponse {
  error?: {
    mensaje?: string;
    message?: string;
  };
  message?: string;
  status?: number;
  statusText?: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-menu.component.html',
  styleUrls: ['./auth-menu.component.css'],
})
export class AuthComponent implements OnInit {
  // Signals para mejor reactividad (Angular 20)
  mostrarOpciones = signal<boolean>(false);
  opcionSeleccionada = signal<OpcionAuth>(null);
  mensajeError = signal<string>('');
  mensajeExito = signal<string>('');
  cargando = signal<boolean>(false);
  animacionActiva = signal<boolean>(false);

  // Formularios
  registroForm!: FormGroup;
  loginForm!: FormGroup;
  adminForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    // Verificar sesión activa
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private inicializarFormularios(): void {
    // Formulario de registro
    this.registroForm = this.fb.group(
      {
        nombre: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
          ],
        ],
        confirmarPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Formulario de login de usuario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Formulario de login de administrador
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      codigo2FA: ['', [Validators.pattern(/^\d{6}$/)]],
    });
  }

  // Validador personalizado mejorado
  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmarPassword = control.get('confirmarPassword');

    if (!password || !confirmarPassword) {
      return null;
    }

    if (confirmarPassword.value === '') {
      return null;
    }

    if (password.value !== confirmarPassword.value) {
      confirmarPassword.setErrors({
        ...confirmarPassword.errors,
        passwordMismatch: true,
      });
      return { passwordMismatch: true };
    }

    // Limpiar solo el error de coincidencia
    if (confirmarPassword.errors) {
      delete confirmarPassword.errors['passwordMismatch'];
      if (Object.keys(confirmarPassword.errors).length === 0) {
        confirmarPassword.setErrors(null);
      }
    }

    return null;
  }

  // Método auxiliar para extraer mensajes de error
  private extraerMensajeError(error: unknown, mensajeDefault: string): string {
    if (error instanceof HttpErrorResponse) {
      // Error HTTP del servidor
      return (
        error.error?.mensaje ||
        error.error?.message ||
        error.message ||
        mensajeDefault
      );
    }

    if (error && typeof error === 'object') {
      const errorObj = error as ErrorResponse;
      return (
        errorObj.error?.mensaje ||
        errorObj.error?.message ||
        errorObj.message ||
        mensajeDefault
      );
    }

    if (typeof error === 'string') {
      return error;
    }

    return mensajeDefault;
  }

  // Mostrar las opciones al hacer clic en "Ingresar"
  mostrarOpcionesIngreso(): void {
    this.animacionActiva.set(true);
    setTimeout(() => {
      this.mostrarOpciones.set(true);
      this.animacionActiva.set(false);
    }, 300);
  }

  // Seleccionar una opción
  seleccionarOpcion(opcion: 'registro' | 'login' | 'admin'): void {
    this.opcionSeleccionada.set(opcion);
    this.limpiarMensajes();
    this.resetearFormularios();
  }

  // Volver al menú de opciones
  volverAOpciones(): void {
    this.opcionSeleccionada.set(null);
    this.limpiarMensajes();
  }

  // Volver al inicio
  volverInicio(): void {
    this.mostrarOpciones.set(false);
    this.opcionSeleccionada.set(null);
    this.limpiarMensajes();
  }

  // Método auxiliar para extraer datos de registro sin confirmarPassword
  private prepararDatosRegistro(
    formValue: DatosRegistro & { confirmarPassword: string }
  ): DatosRegistro {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmarPassword: _confirmarPassword, ...datosRegistro } =
      formValue;
    return datosRegistro;
  }

  // Registro de usuario
  async registrar(): Promise<void> {
    if (!this.registroForm.valid) {
      this.marcarCamposInvalidos(this.registroForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosRegistro = this.prepararDatosRegistro(
        this.registroForm.value as DatosRegistro & { confirmarPassword: string }
      );

      await firstValueFrom(this.authService.registrar(datosRegistro));

      this.mensajeExito.set('¡Registro exitoso! Redirigiendo al dashboard...');

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } catch (error: unknown) {
      const mensaje = this.extraerMensajeError(
        error,
        'Error al registrar usuario. Por favor, intente nuevamente.'
      );
      this.mensajeError.set(mensaje);
      console.error('Error en registro:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Login de usuario normal
  async loginUsuario(): Promise<void> {
    if (!this.loginForm.valid) {
      this.marcarCamposInvalidos(this.loginForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosLogin = this.loginForm.value as DatosLogin;
      await firstValueFrom(this.authService.login(datosLogin));

      this.mensajeExito.set('¡Inicio de sesión exitoso! Redirigiendo...');

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (error: unknown) {
      const mensaje = this.extraerMensajeError(
        error,
        'Credenciales inválidas. Verifique su email y contraseña.'
      );
      this.mensajeError.set(mensaje);
      console.error('Error en login:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Login de administrador
  async loginAdmin(): Promise<void> {
    if (!this.adminForm.valid) {
      this.marcarCamposInvalidos(this.adminForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosLoginAdmin = this.adminForm.value as DatosLoginAdmin;
      await firstValueFrom(this.authService.loginAdmin(datosLoginAdmin));

      this.mensajeExito.set('¡Acceso de administrador concedido!');

      setTimeout(() => {
        this.router.navigate(['/admin/dashboard']);
      }, 1500);
    } catch (error: unknown) {
      const mensaje = this.extraerMensajeError(
        error,
        'Credenciales de administrador inválidas o acceso denegado.'
      );
      this.mensajeError.set(mensaje);
      console.error('Error en login admin:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Utilidades
  private marcarCamposInvalidos(form: FormGroup): void {
    Object.keys(form.controls).forEach((key: string) => {
      const control = form.get(key);
      if (control?.invalid) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }

  private limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  private resetearFormularios(): void {
    this.registroForm.reset();
    this.loginForm.reset();
    this.adminForm.reset();
  }

  // Getters para validación en el template
  get nombreInvalido(): boolean {
    const campo = this.registroForm.get('nombre');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get emailRegistroInvalido(): boolean {
    const campo = this.registroForm.get('email');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get passwordRegistroInvalido(): boolean {
    const campo = this.registroForm.get('password');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get confirmarPasswordInvalido(): boolean {
    const campo = this.registroForm.get('confirmarPassword');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get emailLoginInvalido(): boolean {
    const campo = this.loginForm.get('email');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get passwordLoginInvalido(): boolean {
    const campo = this.loginForm.get('password');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get emailAdminInvalido(): boolean {
    const campo = this.adminForm.get('email');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  get passwordAdminInvalido(): boolean {
    const campo = this.adminForm.get('password');
    return !!(campo?.invalid && (campo?.touched || campo?.dirty));
  }

  // Helpers para el template con signals
  get mostrandoOpciones(): boolean {
    return this.mostrarOpciones();
  }

  get opcionActual(): OpcionAuth {
    return this.opcionSeleccionada();
  }

  get errorActual(): string {
    return this.mensajeError();
  }

  get exitoActual(): string {
    return this.mensajeExito();
  }

  get estaCargando(): boolean {
    return this.cargando();
  }

  get animacionEnCurso(): boolean {
    return this.animacionActiva();
  }
}
