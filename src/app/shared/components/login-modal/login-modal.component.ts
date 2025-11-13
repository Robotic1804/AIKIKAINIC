import {
  Component,
  inject,
  effect,
  signal,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { NotificationService } from 'src/app/services/notification.service';

// Tipos
type Modo = 'login' | 'register' | 'recuperar';

// Interfaz actualizada para el registro
interface DatosRegistro {
  name: string; // Mapeado a 'name' en el backend si es necesario
  email: string;
  password: string;
  confirmarPassword: string;
  edad?: number; // Opcional, puedes eliminarlo si se calcula desde la fecha de nacimiento
  telefono?: string;
  birthMonth: string; // Número del mes como string
  birthDay: string; // Número del día como string
  rank: string; // Valor del rango (e.g., '6kyu')
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
  visible = signal<boolean>(false);

  // Formularios
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  recoveryForm!: FormGroup;

  // Opciones para los selectores
  months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Generar días (1 a 31)
  days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  ranks = [
    { value: '6kyu', label: '6º Kyu (Blanco)' },
    { value: '5kyu', label: '5º Kyu (Amarillo)' },
    { value: '4kyu', label: '4º Kyu (Naranja)' },
    { value: '3kyu', label: '3º Kyu (Verde)' },
    { value: '2kyu', label: '2º Kyu (Azul)' },
    { value: '1kyu', label: '1º Kyu (Marrón)' },
    { value: '1dan', label: '1º Dan (Negro)' },
    { value: '2dan', label: '2º Dan (Negro)' },
    { value: '3dan', label: '3º Dan (Negro)' },
    { value: '4dan', label: '4º Dan (Negro)' },
    { value: '5dan', label: '5º Dan (Negro)' },
    { value: '6dan', label: '6º Dan (Negro)' },
    { value: '7dan', label: '7º Dan (Negro)' },
    { value: '8dan', label: '8º Dan (Negro)' },
  ];

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private notificationService = inject(NotificationService);
  @ViewChild('modalElement') modalElement!: ElementRef;

  constructor() {
    this.inicializarFormularios();

    effect(() => {
      const visible = this.modalService.loginModalVisible();
      this.visible.set(visible);
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, no mostrar el modal
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']); // Ajusta la ruta según tu aplicación
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

    // Formulario de registro actualizado
    this.registerForm = this.fb.group(
      {
        name: [
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
        confirmPassword: ['', [Validators.required]],
        edad: ['', [Validators.min(18), Validators.max(120)]], // Puedes mantenerlo o eliminarlo
        phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        birthMonth: ['', [Validators.required]], // Campo requerido
        birthDay: ['', [Validators.required]], // Campo requerido
        rank: ['6kyu', [Validators.required]], // Valor por defecto
      },
      {
        validators: [
          this.passwordMatchValidator,
          this.fechaNacimientoValidator,
        ],
      } // Añadido validador de fecha
    );

    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // Validador para coincidencia de contraseñas
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

  // Validador personalizado para la fecha de nacimiento
  private fechaNacimientoValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const birthMonth = control.get('birthMonth')?.value;
    const birthDay = control.get('birthDay')?.value;

    if (birthMonth && birthDay) {
      const month = parseInt(birthMonth, 10);
      const day = parseInt(birthDay, 10);

      if (isNaN(month) || isNaN(day)) {
        return { invalidDate: true };
      }

      // Validar día contra mes
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Considera febrero bisiesto como 29
      if (day < 1 || day > daysInMonth[month - 1]) {
        return { invalidDate: true };
      }

      // Opcional: Validar que la fecha no sea en el futuro
      const today = new Date();
      const birthYear = today.getFullYear(); // Suponemos año actual para simplificar
      const birthDate = new Date(birthYear, month - 1, day); // month es 1-based, Date() es 0-based

      if (birthDate > today) {
        // Si la fecha calculada es futura, es inválida
        if (
          birthDate.getFullYear() === today.getFullYear() &&
          birthDate.getMonth() >= today.getMonth() &&
          birthDate.getDate() > today.getDate()
        ) {
          return { invalidDate: true };
        }
      }

      return null; // Fecha válida
    }

    // Si no hay valores, no hay error de validación aquí (otros validadores pueden aplicar)
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
      // Preparar los datos para enviarlos al backend
      // Asegúrate de que el AuthService espere estos campos
      const datosRegistro: DatosRegistro = this.registerForm.getRawValue();
      // Opcional: Convertir los campos de fecha a un formato específico si el backend lo requiere
      // const fechaNacimiento = `${datosRegistro.birthYear}-${datosRegistro.birthMonth.padStart(2,'0')}-${datosRegistro.birthDay.padStart(2,'0')}`;
      // const datosParaEnviar = { ...datosRegistro, fechaNacimiento };

      // Asegúrate de que tu AuthService.registrar espere la estructura DatosRegistro
      await firstValueFrom(this.authService.registrar(datosRegistro)); // Asegúrate que el servicio maneje los nuevos campos

      this.mensajeExito.set(
        '¡Registro exitoso! Por favor verifica tu email para activar tu cuenta.'
      );
      setTimeout(() => {
        this.modo.set('login');
        this.registerForm.reset(); // Esto también limpiará los selects
        // Opcional: Reiniciar selects a valores por defecto
        // this.registerForm.patchValue({ birthMonth: '', birthDay: '', rank: '6kyu' });
      }, 1500);
    } catch (error: unknown) {
      this.mensajeError.set(this.extraerMensajeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async enviarRecuperacion(): Promise<void> {
    if (this.recoveryForm.invalid) {
      this.marcarCamposInvalidos(this.recoveryForm);
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {
      const email = this.recoveryForm.get('email')?.value;
      await firstValueFrom(this.authService.solicitarResetPassword({ email }));

      this.mensajeExito.set(
        '¡Correo de recuperación enviado! Revisa tu bandeja de entrada.'
      );

      setTimeout(() => {
        this.modo.set('login');
        this.recoveryForm.reset();
      }, 3000);
    } catch (error: unknown) {
      this.mensajeError.set(this.extraerMensajeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarModo(nuevoModo: Modo): void {
    this.modo.set(nuevoModo);
    this.limpiarMensajes();
  }

  recuperarPassword(): void {
    this.cambiarModo('recuperar');
  }

  cerrar(): void {
    this.visible.set(false);
    this.modalService.cerrarLoginModal();
    this.modo.set('login');
    this.loginForm.reset();
    this.registerForm.reset();
    this.recoveryForm.reset();
    // Opcional: Reiniciar selects a valores por defecto
    // this.registerForm.patchValue({ birthMonth: '', birthDay: '', rank: '6kyu' });
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
        ? '/admin/dashboard' // Ajusta la ruta según tu aplicación
        : '/dashboard'; // Ajusta la ruta según tu aplicación
    this.router.navigate([url]);
  }

  // Getters para validación (login y recovery)
  get emailLoginInvalido(): boolean {
    const campo = this.loginForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get passwordLoginInvalido(): boolean {
    const campo = this.loginForm.get('password');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get emailRecuperacionInvalido(): boolean {
    const campo = this.recoveryForm.get('email');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  // Getters para validación del formulario de registro
  get nombreInvalido(): boolean {
    const campo = this.registerForm.get('name');
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
    const campo = this.registerForm.get('confirmPassword');
    const mismatch = this.registerForm.hasError('passwordMismatch');
    return !!(campo?.invalid && (campo.touched || campo.dirty) && mismatch);
  }

  get edadInvalida(): boolean {
    const campo = this.registerForm.get('edad');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get telefonoInvalido(): boolean {
    const campo = this.registerForm.get('phone');
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get birthMonthInvalido(): boolean {
    const campo = this.registerForm.get('birthMonth');
    // Chequea si el campo está vacío o si hay un error de fecha
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get birthDayInvalido(): boolean {
    const campo = this.registerForm.get('birthDay');
    // Chequea si el campo está vacío o si hay un error de fecha
    return !!(campo?.invalid && (campo.touched || campo.dirty));
  }

  get fechaNacimientoInvalida(): boolean {
    // Chequea si hay un error general de fecha (por ejemplo, día inválido para el mes)
    return !!(
      this.registerForm.hasError('invalidDate') &&
      (this.registerForm.get('birthMonth')?.touched ||
        this.registerForm.get('birthDay')?.touched)
    );
  }

  get rankInvalido(): boolean {
    const campo = this.registerForm.get('rank');
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
