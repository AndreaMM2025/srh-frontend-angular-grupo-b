import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

import { ReservasService } from '../../core/services/reservas.service';
import { ClientesService } from '../../core/services/clientes.service';
import { HabitacionesService } from '../../core/services/habitaciones.service';

import { Reserva } from '../../core/models/reserva';
import { Cliente } from '../../core/models/cliente';
import { Habitacion } from '../../core/models/habitacion';

@Component({
  standalone: true,
  selector: 'app-reservas-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {
  private fb = inject(FormBuilder);
  private reservasService = inject(ReservasService);
  private clientesService = inject(ClientesService);
  private habitacionesService = inject(HabitacionesService);

  // ✅ FIX: forzar render aunque Angular no "despierte"
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  clientes: Cliente[] = [];
  habitaciones: Habitacion[] = [];

  loadingList = false; // SOLO tabla
  loadingForm = false; // SOLO combos
  saving = false;

  confirmandoId: number | null = null;
  cancelandoId: number | null = null;

  form = this.fb.group({
    cliente_id: [null as number | null, Validators.required],
    habitacion_id: [null as number | null, Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarReservas(); // ✅ listado inmediato
    this.cargarCombos();   // ✅ combos aparte
  }

  // ✅ FIX PRINCIPAL: repintar aunque no toques el input
  cargarReservas() {
    this.loadingList = true;

    this.reservasService
      .listar()
      .pipe(
        finalize(() => {
          this.loadingList = false;

          // ✅ fuerza render final
          this.zone.run(() => {
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.reservas = d ?? [];
            this.reservasFiltradas = [...this.reservas];

            // ✅ pinta de inmediato
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.zone.run(() => this.cdr.detectChanges());
        },
      });
  }

  cargarCombos() {
    this.loadingForm = true;

    let pending = 2;
    const done = () => {
      pending--;
      if (pending <= 0) {
        this.loadingForm = false;
        // ✅ por si la vista no refresca sola
        this.zone.run(() => this.cdr.detectChanges());
      }
    };

    this.clientesService.listar().subscribe({
      next: (d) => {
        this.clientes = d ?? [];
        this.zone.run(() => this.cdr.detectChanges());
      },
      error: (e) => console.error(e),
      complete: done,
    });

    this.habitacionesService.listar().subscribe({
      next: (d) => {
        this.habitaciones = d ?? [];
        this.zone.run(() => this.cdr.detectChanges());
      },
      error: (e) => console.error(e),
      complete: done,
    });
  }

  get habitacionesDisponibles(): Habitacion[] {
    return (this.habitaciones ?? []).filter((h) => h.disponible === true);
  }

  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();
    if (!q) {
      this.reservasFiltradas = [...this.reservas];
      return;
    }

    this.reservasFiltradas = this.reservas.filter((r) => {
      const cliente = this.nombreCliente(r.cliente_id);
      const hab = this.numeroHabitacion(r.habitacion_id);
      return `${r.id} ${cliente} ${hab} ${r.fecha_inicio} ${r.fecha_fin} ${r.estado}`
        .toLowerCase()
        .includes(q);
    });
  }

  limpiar() {
    this.form.reset({
      cliente_id: null,
      habitacion_id: null,
      fecha_inicio: '',
      fecha_fin: '',
    });
  }

  nombreCliente(id: number) {
    const c = this.clientes.find((x) => x.id === id);
    return c ? c.nombre : `Cliente #${id}`;
  }

  numeroHabitacion(id: number) {
    const h = this.habitaciones.find((x) => x.id === id);
    return h ? h.numero : `Hab #${id}`;
  }

  private fechasValidas(fi: string, ff: string) {
    if (!fi || !ff) return false;
    return new Date(fi).getTime() <= new Date(ff).getTime();
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue() as any;
    const payload = {
      cliente_id: Number(v.cliente_id),
      habitacion_id: Number(v.habitacion_id),
      fecha_inicio: String(v.fecha_inicio),
      fecha_fin: String(v.fecha_fin),
      estado: 'pendiente',
    };

    if (!this.fechasValidas(payload.fecha_inicio, payload.fecha_fin)) {
      alert('La fecha fin no puede ser menor que la fecha inicio.');
      return;
    }

    this.saving = true;
    this.reservasService
      .crear(payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.zone.run(() => this.cdr.detectChanges());
        })
      )
      .subscribe({
        next: () => {
          this.limpiar();
          this.cargarReservas(); // ✅ refresca tabla
        },
        error: (e) => console.error(e),
      });
  }

  // ✅ Confirmar INSTANTÁNEO (optimista + repinta)
  confirmar(r: Reserva) {
    this.confirmandoId = r.id;

    const prevEstado = r.estado;
    const actualizado: Reserva = { ...r, estado: 'confirmada' };

    // ✅ actualiza arrays (repinta instantáneo)
    this.reservas = this.reservas.map(x => x.id === r.id ? actualizado : x);
    this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? actualizado : x);
    this.zone.run(() => this.cdr.detectChanges());

    this.reservasService
      .confirmar(r.id)
      .pipe(
        finalize(() => {
          this.confirmandoId = null;
          this.zone.run(() => this.cdr.detectChanges());
        })
      )
      .subscribe({
        next: (resp) => {
          if (resp?.estado) {
            const finalR: Reserva = { ...actualizado, estado: resp.estado };
            this.reservas = this.reservas.map(x => x.id === r.id ? finalR : x);
            this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? finalR : x);
            this.zone.run(() => this.cdr.detectChanges());
          }
        },
        error: (e) => {
          console.error(e);
          const rollback: Reserva = { ...actualizado, estado: prevEstado };
          this.reservas = this.reservas.map(x => x.id === r.id ? rollback : x);
          this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? rollback : x);
          this.zone.run(() => this.cdr.detectChanges());
        },
      });
  }

  // ✅ Cancelar INSTANTÁNEO (optimista + repinta)
  cancelar(r: Reserva) {
    this.cancelandoId = r.id;

    const prevEstado = r.estado;
    const actualizado: Reserva = { ...r, estado: 'cancelada' };

    this.reservas = this.reservas.map(x => x.id === r.id ? actualizado : x);
    this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? actualizado : x);
    this.zone.run(() => this.cdr.detectChanges());

    this.reservasService
      .cancelar(r.id)
      .pipe(
        finalize(() => {
          this.cancelandoId = null;
          this.zone.run(() => this.cdr.detectChanges());
        })
      )
      .subscribe({
        next: (resp) => {
          if (resp?.estado) {
            const finalR: Reserva = { ...actualizado, estado: resp.estado };
            this.reservas = this.reservas.map(x => x.id === r.id ? finalR : x);
            this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? finalR : x);
            this.zone.run(() => this.cdr.detectChanges());
          }
        },
        error: (e) => {
          console.error(e);
          const rollback: Reserva = { ...actualizado, estado: prevEstado };
          this.reservas = this.reservas.map(x => x.id === r.id ? rollback : x);
          this.reservasFiltradas = this.reservasFiltradas.map(x => x.id === r.id ? rollback : x);
          this.zone.run(() => this.cdr.detectChanges());
        },
      });
  }

  trackById(_: number, item: Reserva) {
    return item.id;
  }

  badgeEstado(estado: string) {
    const s = (estado ?? '').toLowerCase();
    if (s.includes('confirm')) return 'srh-b-ok';
    if (s.includes('cancel')) return 'srh-b-busy';
    return 'srh-b-warn';
  }
}