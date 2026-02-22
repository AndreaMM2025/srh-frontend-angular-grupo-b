import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models/cliente';

@Component({
  standalone: true,
  selector: 'app-clientes-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.page.html',
})
export class ClientesPage implements OnInit {

  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);

  clientes: Cliente[] = [];
  loading = false;

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
  this.clientesService.listar().subscribe({
    next: (d) => (this.clientes = d),
    error: (e) => {
      console.error(e);
      this.loading = false;  
    },
    complete: () => (this.loading = false),
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

  console.log('POST payload:', payload);

  this.clientesService.crear(payload).subscribe({
    next: () => {
      this.form.reset();
      this.cargar();
    },
    error: (e) => console.error('ERROR POST:', e),
  });
}
}