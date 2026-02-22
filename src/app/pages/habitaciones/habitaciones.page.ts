import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { HabitacionesService } from '../../core/services/habitaciones.service';
import { Habitacion } from '../../core/models/habitacion';

@Component({
  standalone: true,
  selector: 'app-habitaciones-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
})
export class HabitacionesPage implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(HabitacionesService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  loading = false;

  editandoId: number | null = null;
  saving = false; // evita doble submit
  deletingId: number | null = null;

  form = this.fb.group({
    numero: ['', Validators.required],
    tipo: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    disponible: [true],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;

    this.service.listar()
      .pipe(finalize(() => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.habitaciones = d ?? [];
            this.habitacionesFiltradas = [...this.habitaciones];
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();
    if (!q) {
      this.habitacionesFiltradas = [...this.habitaciones];
      return;
    }

    this.habitacionesFiltradas = this.habitaciones.filter((h) =>
      `${h.numero} ${h.tipo} ${h.precio} ${h.disponible ? 'disponible' : 'ocupada'}`
        .toLowerCase()
        .includes(q)
    );
  }

  limpiar() {
    this.form.reset({ numero: '', tipo: '', precio: 0, disponible: true });
    this.editandoId = null;
  }

  editar(h: Habitacion) {
    this.editandoId = h.id;
    this.form.patchValue({
      numero: h.numero,
      tipo: h.tipo,
      precio: h.precio,
      disponible: h.disponible,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

eliminar(h: any) {
  const ok = confirm(`¿Eliminar habitación "${h.numero}"?`);
  if (!ok) return;

  this.deletingId = h.id;

  const backupHabitaciones = [...this.habitaciones];
  const backupFiltradas = [...this.habitacionesFiltradas];

  this.habitaciones = this.habitaciones.filter(x => x.id !== h.id);
  this.habitacionesFiltradas = this.habitacionesFiltradas.filter(x => x.id !== h.id);

  this.service.eliminar(h.id).subscribe({
    next: () => {
  
      this.deletingId = null;
    },
    error: (e) => {
      console.error(e);

     
      this.habitaciones = backupHabitaciones;
      this.habitacionesFiltradas = backupFiltradas;

      this.deletingId = null;
      alert('No se pudo eliminar. Revisa el backend.');
    }
  });
}

guardar() {
  if (this.form.invalid || this.saving) return;
  this.saving = true;

  const v = this.form.getRawValue() as any;
  const payload = {
    numero: (v.numero ?? '').trim(),
    tipo: (v.tipo ?? '').trim(),
    precio: Number(v.precio ?? 0),
    disponible: Boolean(v.disponible),
  };

  const done = () => {
    this.saving = false;
    this.limpiar();
    this.cargar();
  };

  if (this.editandoId !== null) {
    this.service.actualizar(this.editandoId, payload).subscribe({
      next: done,
      error: (e) => { console.error(e); this.saving = false; },
    });
    return;
  }

  this.service.crear(payload).subscribe({
    next: done,
    error: (e) => { console.error(e); this.saving = false; },
  });
}
 trackById(index: number, item: any) {
  return item.id;
}
}