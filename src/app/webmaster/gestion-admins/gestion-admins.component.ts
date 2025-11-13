import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

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
  private notificationService = inject(NotificationService);

  adminForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  admins = signal<{ name: string; email: string }[]>([]);

  constructor() {
    this.cargarAdmins();
  }

  private cargarAdmins(): void {
    this.loading.set(true);
    this.authService.obtenerUsuarios().subscribe({
      next: (data) => {
        const admins = data.usuarios
          .filter((u) => u.role === 'admin')
          .map((u) => ({name: u.name, email: u.email }));
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
    const { name, email, password } = this.adminForm.value;

    if (!name || !email || !password) {
      this.loading.set(false);
      return;
    }

    this.authService
      .crearUsuarioAdmin({
        name,
        email,
        password,
        role: 'admin',
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Administrador creado con éxito');
          this.adminForm.reset();
          this.cargarAdmins();
        },
        error: (err) => {
          this.loading.set(false);
          const errorMsg =
            err?.error?.error || 'No se pudo crear el administrador';
          this.notificationService.error(`Error: ${errorMsg}`);
        },
      });
  }

  volver(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
