import { Routes } from '@angular/router';

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
  {
    path: 'auth',
    loadComponent: () =>
      import('./app/shared/components/auth-menu/auth-menu.component').then(
        (m) => m.AuthComponent
      ),
    title: 'Autenticación',
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

  // ==========================================
  // ÁREA DE USUARIOS (Protegida)
  // ==========================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./app/admin/Dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    // canActivate: [authGuard], // Descomentar cuando implementes el guard
    title: 'Dashboard',
  },

  // ==========================================
  // ÁREA DE ADMINISTRACIÓN (Protegida)
  // ==========================================
  {
    path: 'admin',
    // canActivate: [adminGuard], // Descomentar cuando implementes el guard
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./app/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Admin Dashboard',
      },
      // Agregar más rutas de admin aquí si las necesitas
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
