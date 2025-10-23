import { Component, inject, effect, signal, OnInit } from '@angular/core';
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
import { ModalService } from 'src/app/services/modal.service';

// Tipos
type Modo = 'login' | 'register';

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  edad?: number;
  telefono?: string;
}

interface DatosLogin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css'],
})
export class LoginModalComponent implements OnInit {
  // Signals
  modo = signal<Modo>('login');
  mensajeError = signal<string>('');
  mensajeExito = signal<string>('');
  cargando = signal<boolean>(false);
  visible = signal<boolean>(false); // Controla si el modal se muestra

  // Formularios
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  constructor() {
    this.inicializarFormularios();

    // Escuchar cambios en la señal del modal service
    effect(() => {
      const visible = this.modalService.loginModalVisible();
      this.visible.set(visible);
    });
  }



  ngOnInit(): void {
    // Si ya está autenticado, no mostrar el modal
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);

    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.visible()) {
        this.cerrar();
      }
    });
  }

  inicializarFormularios(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group(
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
        edad: ['', [Validators.min(18), Validators.max(120)]],
        telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

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

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.marcarCamposInvalidos(this.loginForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosLogin = this.loginForm.getRawValue() as DatosLogin;
      await firstValueFrom(this.authService.login(datosLogin));

      this.mensajeExito.set('¡Inicio de sesión exitoso!');
      setTimeout(() => {
        this.cerrar();
        this.redirigirPorRol();
      }, 1500);
    } catch (error: unknown) {
      this.mensajeError.set(this.extraerMensajeError(error));
      console.error('Error en login:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async registrar(): Promise<void> {
    if (this.registerForm.invalid) {
      this.marcarCamposInvalidos(this.registerForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const datosRegistro = this.registerForm.getRawValue() as DatosRegistro;
      await firstValueFrom(this.authService.registrar(datosRegistro));

      this.mensajeExito.set('¡Registro exitoso!');
      setTimeout(() => {
        this.modo.set('login');
        this.registerForm.reset();
      }, 1500);
    } catch (error: unknown) {
      this.mensajeError.set(this.extraerMensajeError(error));
      console.error('Error en registro:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarModo(nuevoModo: Modo): void {
    this.modo.set(nuevoModo);
    this.limpiarMensajes();
  }

  cerrar(): void {
    this.visible.set(false);
    this.modo.set('login');
    this.loginForm.reset();
    this.registerForm.reset();
    this.limpiarMensajes();
  }

  abrir(): void {
    this.visible.set(true);
  }

  private extraerMensajeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message || 'Error desconocido';
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Ocurrió un error inesperado';
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

  private redirigirPorRol(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    const url =
      usuario?.role === 'admin' || usuario?.role === 'webmaster'
        ? '/admin/dashboard'
        : '/dashboard';
    this.router.navigate([url]);
  }

  // Getters para validación
  get emailLoginInvalido(): boolean {
    const campo = this.loginForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get passwordLoginInvalido(): boolean {
    const campo = this.loginForm.get('password');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get nombreInvalido(): boolean {
    const campo = this.registerForm.get('nombre');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get emailRegistroInvalido(): boolean {
    const campo = this.registerForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get passwordRegistroInvalido(): boolean {
    const campo = this.registerForm.get('password');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get confirmarPasswordInvalido(): boolean {
    const campo = this.registerForm.get('confirmarPassword');
    const mismatch = campo?.hasError('passwordMismatch');
    return !!(campo?.invalid && (campo.touched || campo.dirty) && mismatch);
  }

  get edadInvalida(): boolean {
    const campo = this.registerForm.get('edad');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get telefonoInvalido(): boolean {
    const campo = this.registerForm.get('telefono');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  // Helpers para template
  get estaCargando(): boolean {
    return this.cargando();
  }

  get errorActual(): string {
    return this.mensajeError();
  }

  get exitoActual(): string {
    return this.mensajeExito();
  }

  get modoActual(): Modo {
    return this.modo();
  }

  get esVisible(): boolean {
    return this.visible();
  }
}
