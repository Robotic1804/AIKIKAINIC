import { Routes } from '@angular/router';
import { authGuard } from './app/features/auth/guards/auth.guard';
import { adminGuard } from './app/features/auth/guards/admin.guard';
import { webmasterGuard } from './app/features/auth/guards/webmastern.guard';

export const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./app/pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Inicio',
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import(
        './app/features/auth/reset-password/reset-password.component'
      ).then((m) => m.ResetPasswordComponent),
    title: 'Restablecer Contraseña',
  },
  {
    path: 'auth/cambiar-password-obligatorio',
    loadComponent: () =>
      import(
        './app/features/auth/reset-password/reset-password.component'
      ).then((m) => m.ResetPasswordComponent),
    title: 'Cambiar Contraseña Obligatorio',
  },
  {
    path: 'email-verificado',
    loadComponent: () =>
      import(
        './app/features/auth/email-verificado/email-verificado.component'
      ).then((m) => m.EmailVerificadoComponent),
    title: 'Email Verificado',
  },

  // ==========================================
  // INFORMACIÓN DE AIKIDO
  // ==========================================
  {
    path: 'aikido',
    loadComponent: () =>
      import('./app/pages/aikido/aikido.component').then(
        (m) => m.AikidoComponent
      ),
    title: 'Aikido',
  },
  {
    path: 'aikido-historia', // Corregí el nombre para que coincida con la redirección
    loadComponent: () =>
      import('./app/pages/aikidohistory/aikidohistory.component').then(
        (m) => m.AikidohistoryComponent
      ),
    title: 'Historia del Aikido',
  },

  // ==========================================
  // INFORMACIÓN DEL DOJO
  // ==========================================
  {
    path: 'horarios',
    loadComponent: () =>
      import('./app/pages/horarios/horarios.component').then(
        (m) => m.HorariosComponent
      ),
    title: 'Horarios',
  },
  {
    path: 'anibal',
    loadComponent: () =>
      import('./app/maestros/anibal/anibal.component').then(
        (m) => m.AnibalComponent
      ),
    title: 'Anibal',
  },

  // ==========================================
  // MULTIMEDIA
  // ==========================================
  {
    path: 'galeria',
    loadComponent: () =>
      import('./app/pages/galeria/galeria.component').then(
        (m) => m.GaleriaComponent
      ),
    canActivate: [authGuard],
    title: 'Galería',
  },
  {
    path: 'aiki-face',
    loadComponent: () =>
      import('./app/pages/aiki-face/aiki-face.component').then(
        (m) => m.AikiFaceComponent
      ),
    title: 'Aiki Face',
  },

  // ==========================================
  // ÁREA DE USUARIOS (Protegida)
  // ==========================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./app/admin/Dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
    title: 'Dashboard',
  },

  // ==========================================
  // ÁREA DE ADMINISTRACIÓN (Protegida)
  // ==========================================
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./app/admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ==========================================
  // ÁREA DE WEBMASTER (Protegida)
  // ==========================================
  {
    path: 'webmaster/admins',
    loadComponent: () =>
      import('./app/webmaster/gestion-admins/gestion-admins.component').then(
        (m) => m.GestionAdminsComponent
      ),
    canActivate: [webmasterGuard],
  },

  // ==========================================
  // REDIRECCIONES Y RUTAS NO ENCONTRADAS
  // ==========================================
  {
    path: 'aikidoHistoria', // Ruta antigua
    redirectTo: 'aikido-historia',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
