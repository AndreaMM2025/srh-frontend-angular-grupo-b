import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
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

type ReservaVM = {
  id: number;
  cliente_id: number;
  habitacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';

  clienteNombre: string;
  habitacionLabel: string;

  raw: Reserva;
};

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

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  reservas: Reserva[] = [];

  reservasVM: ReservaVM[] = [];
  reservasVMFiltradas: ReservaVM[] = [];

  clientes: Cliente[] = [];
  habitaciones: Habitacion[] = [];

  loadingList = false;
  loadingForm = false;
  saving = false;

  editandoId: number | null = null;
  deletingId: number | null = null;
  accionandoId: number | null = null;

  form = this.fb.group({
    cliente_id: [null as number | null, Validators.required],
    habitacion_id: [null as number | null, Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarCombos();
  }

  // ==========================
  // LISTADO
  // ==========================
  cargarReservas() {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.reservasService
      .listar()
      .pipe(finalize(() => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.reservas = d ?? [];
            this.rebuildVM();
            this.cdr.detectChanges();
          });
        },
        error: (e) => console.error(e),
      });
  }

  // ==========================
  // COMBOS
  // ==========================
  cargarCombos() {
    this.loadingForm = true;

    let pending = 2;
    const done = () => {
      pending--;
      if (pending <= 0) {
        this.loadingForm = false;
        this.rebuildVM();
        this.cdr.detectChanges();
      }
    };

    this.clientesService.listar().subscribe({
      next: (d) => {
        this.clientes = d ?? [];
        this.rebuildVM();
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
      complete: done,
    });

  this.habitacionesService.listar().subscribe({
  next: (d) => {
    this.habitaciones = d ?? [];
    this.cdr.detectChanges();
  },
  error: (e) => console.error(e),
  complete: done,
});
}

  // ==========================
  // VM
  // ==========================
  private rebuildVM() {
    const vm: ReservaVM[] = (this.reservas ?? []).map((r) => {
      const clienteNombre = this.nombreCliente(r.cliente_id);
      const habitacionLabel = this.labelHabitacion(r.habitacion_id);

      return {
        id: r.id,
        cliente_id: r.cliente_id,
        habitacion_id: r.habitacion_id,
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        estado: (r.estado ?? 'pendiente') as any,
        clienteNombre,
        habitacionLabel,
        raw: r,
      };
    });

    vm.sort((a, b) => a.id - b.id);
    this.reservasVM = vm;
    this.reservasVMFiltradas = [...vm];
  }

  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();

    if (!q) {
      this.reservasVMFiltradas = [...this.reservasVM];
      this.cdr.detectChanges();
      return;
    }

    this.reservasVMFiltradas = this.reservasVM.filter((r) => {
      return `${r.id} ${r.clienteNombre} ${r.habitacionLabel} ${r.fecha_inicio} ${r.fecha_fin} ${r.estado}`
        .toLowerCase()
        .includes(q);
    });

    this.cdr.detectChanges();
  }

  trackById(_: number, item: ReservaVM) {
    return item.id;
  }

  // ==========================
  // FORM
  // ==========================
  limpiar() {
    this.form.reset({
      cliente_id: null,
      habitacion_id: null,
      fecha_inicio: '',
      fecha_fin: '',
    });
    this.editandoId = null;
    this.cdr.detectChanges();
  }

editar(r: Reserva) {
  this.editandoId = r.id;
  this.form.patchValue({
    cliente_id: r.cliente_id,
    habitacion_id: r.habitacion_id,
    fecha_inicio: r.fecha_inicio,
    fecha_fin: r.fecha_fin,
  }, { emitEvent: false });
  
  this.cdr.detectChanges();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue() as any;
    const payload = {
      cliente_id: Number(v.cliente_id),
      habitacion_id: Number(v.habitacion_id),
      fecha_inicio: String(v.fecha_inicio),
      fecha_fin: String(v.fecha_fin),
    };

    this.saving = true;
    this.cdr.detectChanges();

    // UPDATE
    if (this.editandoId !== null) {
      const id = this.editandoId;

      this.reservasService.actualizar(id, payload as any)
        .pipe(finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (resp) => {
            // ✅ aquí se arregla el “no se ve el cambio”
            this.reservas = this.reservas.map((x) => (x.id === id ? resp : x));
            this.rebuildVM();
            this.limpiar();
            this.cdr.detectChanges();
          },
          error: (e) => console.error(e),
        });

      return;
    }

    // CREATE
    this.reservasService.crear(payload as any)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.reservas = [resp, ...this.reservas];
          this.rebuildVM();
          this.limpiar();
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
  }

  // ==========================
  // ACCIONES
  // ==========================
  confirmar(r: Reserva) {
    this.accionandoId = r.id;

    this.reservasService.confirmar(r.id)
      .pipe(finalize(() => {
        this.accionandoId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.reservas = this.reservas.map((x) => (x.id === r.id ? resp : x));
          this.rebuildVM();
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
  }

  cancelar(r: Reserva) {
    this.accionandoId = r.id;

    this.reservasService.cancelar(r.id)
      .pipe(finalize(() => {
        this.accionandoId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.reservas = this.reservas.map((x) => (x.id === r.id ? resp : x));
          this.rebuildVM();
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
  }

  eliminar(r: Reserva) {
    const ok = confirm(`¿Eliminar la reserva #${r.id}?`);
    if (!ok) return;

    this.deletingId = r.id;

    this.reservasService.eliminar(r.id)
      .pipe(finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          // ✅ aquí se arregla el “no se elimina visualmente”
          this.reservas = this.reservas.filter((x) => x.id !== r.id);
          this.rebuildVM();
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
  }

  // ==========================
  // HELPERS
  // ==========================
  private nombreCliente(id: number) {
    const c = this.clientes.find((x) => x.id === id);
    return c ? c.nombre : `Cliente #${id}`;
  }

  private labelHabitacion(id: number) {
    const h = this.habitaciones.find((x) => x.id === id);
    if (!h) return `Hab #${id}`;
    return String(h.numero ?? h.id);
  }
}