import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/models/usuario';

type UsuarioVM = {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  email?: string;
  estado: boolean;
  rolBadge: string;
  raw: Usuario;
};

@Component({
  standalone: true,
  selector: 'app-usuarios-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // data
  usuarios: Usuario[] = [];
  usuariosVM: UsuarioVM[] = [];
  usuariosVMFiltradas: UsuarioVM[] = [];

  // ui
  loadingList = false;
  loadingForm = false;
  saving = false;

  editandoId: number | null = null;
  deletingId: number | null = null;

  roles = [
    { value: 'admin', label: 'Administrador', class: 'bg-danger' },
    { value: 'manager', label: 'Manager', class: 'bg-primary' },
    { value: 'recepcionista', label: 'Recepcionista', class: 'bg-success' },
    { value: 'supervisor', label: 'Supervisor', class: 'bg-info' },
    { value: 'limpieza', label: 'Limpieza', class: 'bg-warning' },
    { value: 'mantenimiento', label: 'Mantenimiento', class: 'bg-secondary' },
    { value: 'seguridad', label: 'Seguridad', class: 'bg-dark' },
    { value: 'cocina', label: 'Cocina', class: 'bg-orange' },
  ];

  form = this.fb.group({
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    rol: ['recepcionista', Validators.required],
    email: ['', [Validators.email]],
    estado: [true],
  });

  ngOnInit(): void {
    
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.usuariosService.listar()
      .pipe(finalize(() => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.usuarios = d ?? [];
            this.rebuildVM();
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

  private rebuildVM() {
    const vm: UsuarioVM[] = (this.usuarios ?? []).map((u) => {
      return {
        id: u.id,
        nombre: u.nombre,
        username: u.username,
        rol: u.rol,
        email: u.email,
        estado: u.estado,
        rolBadge: this.getRolBadgeClass(u.rol),
        raw: u,
      };
    });

    vm.sort((a, b) => a.id - b.id);

    this.usuariosVM = vm;
    this.usuariosVMFiltradas = [...vm];
  }

  private getRolBadgeClass(rol: string): string {
    const rolMap: { [key: string]: string } = {
      'admin': 'bg-danger',
      'manager': 'bg-primary',
      'recepcionista': 'bg-success',
      'supervisor': 'bg-info',
      'limpieza': 'bg-warning',
      'mantenimiento': 'bg-secondary',
      'seguridad': 'bg-dark',
      'cocina': 'bg-orange'
    };
    return rolMap[rol] || 'bg-secondary';
  }

  // ==========================
  // BUSCAR
  // ==========================
  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();
    if (!q) {
      this.usuariosVMFiltradas = [...this.usuariosVM];
      this.cdr.detectChanges();
      return;
    }

    this.usuariosVMFiltradas = this.usuariosVM.filter((u) => {
      return `${u.id} ${u.nombre} ${u.username} ${u.rol} ${u.email}`
        .toLowerCase()
        .includes(q);
    });

    this.cdr.detectChanges();
  }

  trackById(_: number, item: UsuarioVM) {
    return item.id;
  }

  // ==========================
  // FORM
  // ==========================
  limpiar() {
    this.form.reset({
      nombre: '',
      username: '',
      password: '',
      rol: 'recepcionista',
      email: '',
      estado: true,
    });
    this.editandoId = null;
    this.cdr.detectChanges();
  }

  editar(u: Usuario) {
    this.editandoId = u.id;
    this.form.patchValue({
      nombre: u.nombre,
      username: u.username,
      password: '',
      rol: u.rol,
      email: u.email || '',
      estado: u.estado,
    });
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    const v = this.form.getRawValue();
    const payload: any = {
      nombre: v.nombre,
      username: v.username,
      rol: v.rol,
      email: v.email,
      estado: v.estado,
    };

    if (v.password && v.password.trim() !== '') {
      payload.password = v.password;
    }

    // UPDATE - Optimista
    if (this.editandoId !== null) {
      const id = this.editandoId;

      const backup = this.usuarios.find(x => x.id === id);
      this.usuarios = this.usuarios.map(x => x.id === id ? { ...x, ...payload } : x);
      this.rebuildVM();
      this.cdr.detectChanges();

      this.usuariosService.actualizar(id, payload)
        .pipe(finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (resp) => {
            this.usuarios = this.usuarios.map(x => x.id === id ? resp : x);
            this.rebuildVM();
            this.limpiar();
            this.cdr.detectChanges();
          },
          error: (e) => {
            console.error(e);
            // Revertir si falla
            if (backup) {
              this.usuarios = this.usuarios.map(x => x.id === id ? backup : x);
              this.rebuildVM();
            }
            alert('Error: ' + (e.error?.detail || 'No se pudo actualizar'));
            this.cdr.detectChanges();
          },
        });
      return;
    }

    // CREATE - Optimista
    const tempId = Date.now();
    const nuevoUsuario: Usuario = {
      id: tempId,
      ...payload,
    } as Usuario;


    this.usuarios = [nuevoUsuario, ...this.usuarios];
    this.rebuildVM();
    this.cdr.detectChanges();

    this.usuariosService.crear(payload)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          // Reemplazar temporal con real
          this.usuarios = this.usuarios.map(x => x.id === tempId ? resp : x);
          this.rebuildVM();
          this.limpiar();
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          // Revertir si falla
          this.usuarios = this.usuarios.filter(x => x.id !== tempId);
          this.rebuildVM();
          alert('Error: ' + (e.error?.detail || 'No se pudo crear'));
          this.cdr.detectChanges();
        },
      });
  }

  eliminar(u: Usuario) {
    if (!confirm(`¿Eliminar el usuario "${u.nombre}"?`)) return;

    this.deletingId = u.id;

    const backup = [...this.usuarios];
    this.usuarios = this.usuarios.filter(x => x.id !== u.id);
    this.rebuildVM();
    this.cdr.detectChanges();

    this.usuariosService.eliminar(u.id)
      .pipe(finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          // Ya está eliminado en UI
        },
        error: (e) => {
          console.error(e);
          // Rollback si falla
          this.usuarios = backup;
          this.rebuildVM();
          alert('Error: ' + (e.error?.detail || 'No se pudo eliminar'));
          this.cdr.detectChanges();
        },
      });
  }

  toggleEstado(u: Usuario) {
    const accion = u.estado ? 'desactivar' : 'activar';
    if (!confirm(`¿${accion === 'desactivar' ? 'Desactivar' : 'Activar'} al usuario "${u.nombre}"?`)) return;

    const backupEstado = u.estado;
    u.estado = !u.estado;
    this.rebuildVM();
    this.cdr.detectChanges();

    const serviceMethod = backupEstado ? 
      this.usuariosService.desactivar(u.id) : 
      this.usuariosService.activar(u.id);

    serviceMethod.subscribe({
      next: () => {
        // Ya está actualizado en UI
      },
      error: (e) => {
        console.error(e);
        // Revertir si falla
        u.estado = backupEstado;
        this.rebuildVM();
        alert('Error al cambiar el estado');
        this.cdr.detectChanges();
      },
    });
  }

  getRolLabel(rol: string): string {
    return this.roles.find(r => r.value === rol)?.label || rol;
  }
}