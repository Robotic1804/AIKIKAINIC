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
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistroFormValues, OpcionAuth, DatosLogin, DatosRegistro } from '../models/auth.types';




@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-menu.component.html',
  styleUrls: ['./auth-menu.component.css'],
})
export class AuthComponent implements OnInit {
  // Signals
  mostrarOpciones = signal<boolean>(false);
  opcionSeleccionada = signal<OpcionAuth>(null);
  mensajeError = signal<string>('');
  mensajeExito = signal<string>('');
  cargando = signal<boolean>(false);
  animacionActiva = signal<boolean>(false);

  // Formularios
  registroForm!: FormGroup;
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      this.redirigirPorRol();
    }
  }

  private inicializarFormularios(): void {
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

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Validador personalizado: solo devuelve errores, no modifica controles.
   */
  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (password && confirmarPassword && password !== confirmarPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  private extraerMensajeError(error: unknown, mensajeDefault: string): string {
    if (error instanceof HttpErrorResponse) {
      return (
        error.error?.mensaje ||
        error.error?.message ||
        error.message ||
        mensajeDefault
      );
    }

    const errorObj = error as {
      error?: {
        mensaje?: string;
        message?: string;
      };
      message?: string;
    };

    return (
      errorObj.error?.mensaje ||
      errorObj.error?.message ||
      errorObj.message ||
      mensajeDefault
    );
  }

  mostrarOpcionesIngreso(): void {
    this.animacionActiva.set(true);
    setTimeout(() => {
      this.mostrarOpciones.set(true);
      this.animacionActiva.set(false);
    }, 300);
  }

  seleccionarOpcion(opcion: OpcionAuth): void {
    this.opcionSeleccionada.set(opcion);
    this.limpiarMensajes();
    this.resetearFormularios();
  }

  volverAOpciones(): void {
    this.opcionSeleccionada.set(null);
    this.limpiarMensajes();
  }

  volverInicio(): void {
    this.mostrarOpciones.set(false);
    this.opcionSeleccionada.set(null);
    this.limpiarMensajes();
  }

  private prepararDatosRegistro(
    formValue: RegistroFormValues
  ): DatosRegistro {
    // Validación en tiempo de ejecución
    if (
      typeof formValue.nombre !== 'string' ||
      typeof formValue.email !== 'string' ||
      typeof formValue.password !== 'string'
    ) {
      throw new Error('Datos de registro inválidos');
    }

    return {
      nombre: formValue.nombre,
      email: formValue.email,
      password: formValue.password,
    };
  }

  async registrar(): Promise<void> {
    if (this.registroForm.invalid) {
      this.marcarCamposInvalidos(this.registroForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosRegistro = this.prepararDatosRegistro(
        this.registroForm.getRawValue()
      );
      await firstValueFrom(this.authService.registrar(datosRegistro));

      this.mensajeExito.set('¡Registro exitoso! Redirigiendo al dashboard...');
      setTimeout(() => this.redirigirPorRol(), 2000);
    } catch (error) {
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

  async loginUsuario(): Promise<void> {
    if (this.loginForm.invalid) {
      this.marcarCamposInvalidos(this.loginForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosLogin = this.loginForm.getRawValue() as DatosLogin;
      await firstValueFrom(this.authService.login(datosLogin));

      this.mensajeExito.set('¡Inicio de sesión exitoso! Redirigiendo...');
      setTimeout(() => this.redirigirPorRol(), 1500);
    } catch (error) {
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

  private redirigirPorRol(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    const url =
      usuario?.role === 'admin' || usuario?.role === 'webmaster'
        ? '/admin/dashboard'
        : '/dashboard';
    this.router.navigate([url]);
  }

  private marcarCamposInvalidos(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
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
  }

  // Getters para validación en el template
  get nombreInvalido(): boolean {
    const campo = this.registroForm.get('nombre');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get emailRegistroInvalido(): boolean {
    const campo = this.registroForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get passwordRegistroInvalido(): boolean {
    const campo = this.registroForm.get('password');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get confirmarPasswordInvalido(): boolean {
    const campo = this.registroForm.get('confirmarPassword');
    const mismatch = campo?.hasError('passwordMismatch');
    return !!(campo?.invalid && (campo.touched || campo.dirty) && mismatch);
  }

  get emailLoginInvalido(): boolean {
    const campo = this.loginForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get passwordLoginInvalido(): boolean {
    const campo = this.loginForm.get('password');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
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
