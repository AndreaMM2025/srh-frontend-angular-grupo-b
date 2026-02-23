import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  // data
  reservas: Reserva[] = [];
  reservasVM: ReservaVM[] = [];
  reservasVMFiltradas: ReservaVM[] = [];

  clientes: Cliente[] = [];
  habitaciones: Habitacion[] = [];
  habitacionesDisponibles: Habitacion[] = [];

  // ui
  loadingList = false;
  loadingForm = false;
  saving = false;

  editandoId: number | null = null;
  deletingId: number | null = null;
  accionandoId: number | null = null;

  // modal error
  mostrarErrorModal = false;
  errorMessage = '';
  errorTitle = 'Error de Validación';

  form = this.fb.group({
    cliente_id: [null as number | null, Validators.required],
    habitacion_id: [null as number | null, Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
  }, { 
    validators: this.fechaFinValida.bind(this)
  });

  ngOnInit(): void {
    // ✅ listado rápido (no depende de combos)
    this.cargarReservas();
    // ✅ combos aparte (no bloquean tabla)
    this.cargarCombos();
  }

  // ✅ VALIDADOR: fecha_fin debe ser >= fecha_inicio
  private fechaFinValida(control: AbstractControl): ValidationErrors | null {
    const fechaInicio = control.get('fecha_inicio')?.value;
    const fechaFin = control.get('fecha_fin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin < inicio) {
        return { fechaFinInvalida: true };
      }
    }
    return null;
  }

  private hoyISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ==========================
  // LISTADO (RÁPIDO + REPINTA)
  // ==========================
  cargarReservas() {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.reservasService.listar()
      .pipe(finalize(() => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.reservas = d ?? [];
            this.rebuildVM();
            this.actualizarHabitacionesDisponibles();
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loadingList = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ==========================
  // COMBOS (SIN BLOQUEAR TABLA)
  // ==========================
  cargarCombos() {
    this.loadingForm = true;

    let pending = 2;
    const done = () => {
      pending--;
      if (pending <= 0) {
        this.loadingForm = false;
        // ✅ cuando llegan combos, re-armamos labels/estado
        this.actualizarHabitacionesDisponibles();
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
        this.actualizarHabitacionesDisponibles();
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
      complete: done,
    });
  }

  // ==========================
  // VM (para pintar bonito/rápido)
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

    // ✅ orden ASC
    vm.sort((a, b) => a.id - b.id);

    this.reservasVM = vm;
    this.reservasVMFiltradas = [...vm];
  }

  // ==========================
  // FILTRO HABITACIONES DISPONIBLES
  // ==========================
  private actualizarHabitacionesDisponibles() {
    const reservasActivas = new Set(
      this.reservas
        .filter(r => r.estado !== 'cancelada')
        .map(r => r.habitacion_id)
    );

    this.habitacionesDisponibles = this.habitaciones.filter(h => 
      h.disponible !== false && !reservasActivas.has(h.id)
    );
  }

  // ==========================
  // BUSCAR
  // ==========================
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

  // ==========================
  // GUARDAR (OPTIMISTA)
  // ==========================
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    const v = this.form.getRawValue() as any;
    const payload = {
      cliente_id: Number(v.cliente_id),
      habitacion_id: Number(v.habitacion_id),
      fecha_inicio: String(v.fecha_inicio),
      fecha_fin: String(v.fecha_fin),
    };

    // UPDATE - Optimista
    if (this.editandoId !== null) {
      const id = this.editandoId;

      // ✅ Actualizar UI primero (optimista)
      const nuevo: Reserva = { id, ...payload, estado: 'pendiente' } as any;
      this.reservas = this.reservas.map((x) => (x.id === id ? nuevo : x));
      this.rebuildVM();
      this.actualizarHabitacionesDisponibles();
      this.cdr.detectChanges();

      this.reservasService.actualizar(id, payload as any)
        .pipe(finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (resp) => {
            this.reservas = this.reservas.map((x) => (x.id === id ? resp : x));
            this.rebuildVM();
            this.limpiar();
            this.cdr.detectChanges();
          },
          error: (e) => {
            console.error(e);
            if (e.status === 400) {
              this.mostrarError('⚠️ Reserva No Permitida', e.error.detail);
            }
            // Revertir si falla
            this.cargarReservas();
          },
        });
      return;
    }

    // CREATE - Optimista
    const nuevaReserva: Reserva = { 
      id: Date.now(), // temporal
      ...payload, 
      estado: 'pendiente' 
    } as any;
    
    // ✅ Agregar a UI primero (optimista)
    this.reservas = [nuevaReserva, ...this.reservas];
    this.rebuildVM();
    this.actualizarHabitacionesDisponibles();
    this.cdr.detectChanges();

    this.reservasService.crear(payload as any)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          // Reemplazar temporal con real
          this.reservas = this.reservas.map(x => 
            x.id === nuevaReserva.id ? resp : x
          );
          this.rebuildVM();
          this.limpiar();
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          if (e.status === 400) {
            this.mostrarError('⚠️ Reserva No Permitida', e.error.detail);
          }
          // Revertir si falla
          this.cargarReservas();
        },
      });
  }

  // ==========================
  // ACCIONES (CONFIRMAR/CANCELAR/ELIMINAR)
  // ==========================
  confirmar(r: Reserva) {
    this.accionandoId = r.id;

    // ✅ Optimista: actualizar UI primero
    const backup = { ...r };
    r.estado = 'confirmada';
    this.rebuildVM();
    this.actualizarHabitacionesDisponibles();
    this.cdr.detectChanges();

    this.reservasService.confirmar(r.id)
      .pipe(finalize(() => {
        this.accionandoId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.reservas = this.reservas.map(x => x.id === r.id ? resp : x);
          this.rebuildVM();
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          // Revertir si falla
          const idx = this.reservas.findIndex(x => x.id === r.id);
          if (idx !== -1) this.reservas[idx] = backup;
          this.rebuildVM();
          this.cdr.detectChanges();
        },
      });
  }

  cancelar(r: Reserva) {
    this.accionandoId = r.id;

    // ✅ Optimista: actualizar UI primero
    const backup = { ...r };
    r.estado = 'cancelada';
    this.rebuildVM();
    this.actualizarHabitacionesDisponibles();
    this.cdr.detectChanges();

    this.reservasService.cancelar(r.id)
      .pipe(finalize(() => {
        this.accionandoId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.reservas = this.reservas.map(x => x.id === r.id ? resp : x);
          this.rebuildVM();
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          // Revertir si falla
          const idx = this.reservas.findIndex(x => x.id === r.id);
          if (idx !== -1) this.reservas[idx] = backup;
          this.rebuildVM();
          this.cdr.detectChanges();
        },
      });
  }

  eliminar(r: Reserva) {
    if (!confirm(`¿Eliminar la reserva #${r.id}?`)) return;

    this.deletingId = r.id;

    // ✅ Backup para rollback + eliminar de UI primero (optimista)
    const backup = [...this.reservas];
    this.reservas = this.reservas.filter(x => x.id !== r.id);
    this.rebuildVM();
    this.actualizarHabitacionesDisponibles();
    this.cdr.detectChanges();

    this.reservasService.eliminar(r.id)
      .pipe(finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          // Ya está eliminado en UI, solo confirmamos
        },
        error: (e) => {
          console.error(e);
          // Rollback si falla
          this.reservas = backup;
          this.rebuildVM();
          this.cdr.detectChanges();
        },
      });
  }

  // ==========================
  // MODAL DE ERROR
  // ==========================
  mostrarError(titulo: string, mensaje: string) {
    this.errorTitle = titulo;
    this.errorMessage = mensaje;
    this.mostrarErrorModal = true;
    this.cdr.detectChanges();
  }

  cerrarErrorModal() {
    this.mostrarErrorModal = false;
    this.errorMessage = '';
    this.cdr.detectChanges();
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