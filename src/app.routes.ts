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

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================


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
    path: 'aikido-historia',
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
    path: 'maestros',
    loadComponent: () =>
      import('./app/pages/maestros/maestros.component').then(
        (m) => m.MaestrosComponent
      ),
    title: 'Maestros',
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

  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./app/admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },

  // ==========================================
  // ÁREA DE USUARIOS (Protegida)
  // ==========================================
  {
    path: 'webmaster/admins',
    loadComponent: () =>
      import('./app/webmaster/gestion-admins/gestion-admins.component').then(
        (m) => m.GestionAdminsComponent
      ),
    canActivate: [webmasterGuard],
  },
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
