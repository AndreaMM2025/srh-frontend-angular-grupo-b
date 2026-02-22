import { Routes } from '@angular/router';

export const routes: Routes = [
  // INICIO (Panel)
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },

  // PÁGINAS
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'habitaciones',
    loadComponent: () =>
      import('./pages/habitaciones/habitaciones.page').then((m) => m.HabitacionesPage),
  },
  {
    path: 'reservas',
    loadComponent: () =>
      import('./pages/reservas/reservas.page').then((m) => m.ReservasPage),
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pages/pagos/pagos.page').then((m) => m.PagosPage),
  },
  {
    path: 'facturas',
    loadComponent: () =>
      import('./pages/facturas/facturas.page').then((m) => m.FacturasPage),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./pages/reportes/reportes.page').then((m) => m.ReportesPage),
  },

  // CUALQUIER OTRA RUTA -> INICIO
  { path: '**', redirectTo: '' },
];