import { Component, inject, signal } from '@angular/core'; // 👈 computed ya no se usa
import { AuthService } from '../../features/auth/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-gestion-admins',
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-admins.component.html',
  styleUrl: './gestion-admins.component.css',
})
export class GestionAdminsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  adminForm = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  admins = signal<{ nombre: string; email: string }[]>([]);

  // ✅ Elimina estas líneas:
  // puedeCrearAdmin = computed(() => this.admins().length < 3);
  // formularioInvalido = computed(() => this.adminForm.invalid);

  constructor() {
    this.cargarAdmins();
  }

  private cargarAdmins(): void {
    this.loading.set(true);
    this.authService.obtenerUsuarios().subscribe({
      next: (data) => {
        const admins = data.usuarios
          .filter((u) => u.role === 'admin')
          .map((u) => ({ nombre: u.nombre, email: u.email }));
        this.admins.set(admins);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  crearAdmin(): void {
    // ✅ Valida directamente aquí (sin computed)
    if (this.adminForm.invalid || this.admins().length >= 3) return;

    this.loading.set(true);
    const { nombre, email, password } = this.adminForm.value;

    if (!nombre || !email || !password) {
      this.loading.set(false);
      return;
    }

    this.authService
      .crearUsuarioAdmin({
        nombre,
        email,
        password,
        role: 'admin',
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          alert('✅ Administrador creado con éxito');
          this.adminForm.reset();
          this.cargarAdmins();
        },
        error: (err) => {
          this.loading.set(false);
          const errorMsg =
            err?.error?.error || 'No se pudo crear el administrador';
          alert(`❌ Error: ${errorMsg}`);
        },
      });
  }

  volver(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
