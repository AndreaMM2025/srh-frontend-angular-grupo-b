import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models/cliente';

@Component({
  standalone: true,
  selector: 'app-clientes-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = false;
  saving = false;

  editandoId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    identificacion: ['', Validators.required],
    telefono: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    nacionalidad: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.cdr.detectChanges();

    this.clientesService
      .listar()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.clientes = d ?? [];
            this.clientesFiltrados = [...this.clientes];
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.clientes = [];
          this.clientesFiltrados = [];
          this.cdr.detectChanges();
        },
      });
  }

  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();

    if (!q) {
      this.clientesFiltrados = [...this.clientes];
      this.cdr.detectChanges();
      return;
    }

    this.clientesFiltrados = this.clientes.filter((c) =>
      `${c.nombre} ${c.identificacion} ${c.correo} ${c.telefono} ${c.nacionalidad}`
        .toLowerCase()
        .includes(q)
    );
    this.cdr.detectChanges();
  }

  limpiar() {
    this.form.reset({
      nombre: '',
      identificacion: '',
      telefono: '',
      correo: '',
      nacionalidad: '',
    });
    this.editandoId = null;
    this.cdr.detectChanges();
  }

  editar(c: Cliente) {
    this.editandoId = c.id;

    this.form.patchValue({
      nombre: c.nombre,
      identificacion: c.identificacion,
      telefono: c.telefono,
      correo: c.correo,
      nacionalidad: c.nacionalidad,
    });

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(c: Cliente) {
    const ok = confirm(`¿Eliminar cliente "${c.nombre}"?`);
    if (!ok) return;


    const backup = [...this.clientes];
    this.clientes = this.clientes.filter((x) => x.id !== c.id);
    this.clientesFiltrados = [...this.clientes];
    this.cdr.detectChanges();

    this.clientesService.eliminar(c.id).subscribe({
      next: () => {},
      error: (e) => {
        console.error(e);
        // rollback
        this.clientes = backup;
        this.clientesFiltrados = [...this.clientes];
        this.cdr.detectChanges();
      },
    });
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue() as any;
    const payload = {
      nombre: (v.nombre ?? '').trim(),
      identificacion: (v.identificacion ?? '').trim(),
      telefono: (v.telefono ?? '').trim(),
      correo: (v.correo ?? '').trim(),
      nacionalidad: (v.nacionalidad ?? '').trim(),
    };

    this.saving = true;
    this.cdr.detectChanges();

    if (this.editandoId !== null) {
      const id = this.editandoId;

      this.clientesService.actualizar(id, payload).subscribe({
        next: (resp) => {
          this.clientes = this.clientes.map((c) => (c.id === id ? resp : c));
          this.clientesFiltrados = [...this.clientes];

          this.limpiar();
          this.saving = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          this.saving = false;
          this.cdr.detectChanges();
          this.cargar();
        },
      });

      return;
    }

    //  CREATE
    this.clientesService.crear(payload).subscribe({
      next: (resp) => {
        this.clientes = [resp, ...this.clientes];
        this.clientesFiltrados = [...this.clientes];

        this.limpiar();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}