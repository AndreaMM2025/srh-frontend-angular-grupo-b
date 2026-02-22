import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type CardItem = {
  title: string;
  desc: string;
  link: string;
  badge: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  cards: CardItem[] = [
    { title: 'Clientes', desc: 'Registrar y gestionar clientes', link: '/clientes', badge: 'CRUD' },
    { title: 'Habitaciones', desc: 'Gestionar habitaciones del hotel', link: '/habitaciones', badge: 'CRUD' },
    { title: 'Reservas', desc: 'Crear y administrar reservas', link: '/reservas', badge: 'CRUD' },
    { title: 'Pagos', desc: 'Registrar pagos de reservas', link: '/pagos', badge: 'CRUD' },
    { title: 'Facturas', desc: 'Emitir / consultar facturas', link: '/facturas', badge: 'CRUD' },
    { title: 'Usuarios', desc: 'Administrar usuarios del sistema', link: '/usuarios', badge: 'CRUD' },
    { title: 'Reportes', desc: 'Visualizar reportes del sistema', link: '/reportes', badge: 'Dashboard' },
  ];
}