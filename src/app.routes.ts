import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./app/pages/home/home.component')
        .then((m) => m.HomeComponent),
  },
  {
    path: 'aikido',
    loadComponent: () =>
      import('./app/pages/aikido/aikido.component').then((m) => m.AikidoComponent),
  },
];
