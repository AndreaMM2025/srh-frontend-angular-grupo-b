import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

import { FacturasService } from '../../core/services/facturas.service';
import { ClientesService } from '../../core/services/clientes.service';
import { ReservasService } from '../../core/services/reservas.service';

import { Factura } from '../../core/models/factura';
import { Cliente } from '../../core/models/cliente';
import { Reserva } from '../../core/models/reserva';

type FacturaVM = {
  id: number;
  cliente_id: number;
  reserva_id: number;
  total: number;
  fecha: string;

  clienteNombre: string;
  reservaLabel: string;
  estado: 'emitida' | 'cancelada' | 'pendiente';

  raw: Factura;
};

@Component({
  standalone: true,
  selector: 'app-facturas-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './facturas.page.html',
  styleUrls: ['./facturas.page.scss'],
})
export class FacturasPage implements OnInit {
  private fb = inject(FormBuilder);
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);
  private reservasService = inject(ReservasService);

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  facturas: Factura[] = [];

  // ✅ VM para pintar rápido (tu HTML usa esto)
  facturasVM: FacturaVM[] = [];
  facturasVMFiltradas: FacturaVM[] = [];

  clientes: Cliente[] = [];
  reservas: Reserva[] = [];

  loadingList = false;   // tabla
  loadingForm = false;   // combos
  saving = false;

  editandoId: number | null = null;
  deletingId: number | null = null;

  form = this.fb.group({
    cliente_id: [null as number | null, Validators.required],
    reserva_id: [null as number | null, Validators.required],
    total: [0, [Validators.required, Validators.min(0)]],
    fecha: ['', Validators.required], // YYYY-MM-DD
  });

  ngOnInit(): void {
    // ✅ listado no depende de combos
    this.cargarFacturas();

    // ✅ combos aparte
    this.cargarCombos();
  }

  // ==========================
  // LISTADO (RÁPIDO)
  // ==========================
  cargarFacturas() {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.facturasService
      .listar()
      .pipe(finalize(() => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (d) => {
          this.zone.run(() => {
            this.facturas = d ?? [];
            this.rebuildVM(); // ✅ arma VM con lo que haya disponible
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

        // ✅ cuando llegan combos, re-armamos labels/estado y repintamos
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

    this.reservasService.listar().subscribe({
      next: (d) => {
        this.reservas = d ?? [];
        this.rebuildVM();
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
      complete: done,
    });
  }

  // ==========================
  // ARMADO VM (CLAVE)
  // ==========================
  private rebuildVM() {
    const vm: FacturaVM[] = (this.facturas ?? []).map((f) => {
      const clienteNombre = this.nombreCliente(f.cliente_id);
      const reservaLabel = this.labelReserva(f.reserva_id);
      const estado = this.estadoFactura(f.reserva_id);

      return {
        id: f.id,
        cliente_id: f.cliente_id,
        reserva_id: f.reserva_id,
        total: f.total,
        fecha: f.fecha,
        clienteNombre,
        reservaLabel,
        estado,
        raw: f,
      };
    });

    // orden desc por id (opcional)
    vm.sort((a, b) => b.id - a.id);

    this.facturasVM = vm;
    this.facturasVMFiltradas = [...vm];
  }

  // ==========================
  // BUSCAR (sobre VM)
  // ==========================
  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();

    if (!q) {
      this.facturasVMFiltradas = [...this.facturasVM];
      this.cdr.detectChanges();
      return;
    }

    this.facturasVMFiltradas = this.facturasVM.filter((f) => {
      return `${f.id} ${f.clienteNombre} ${f.reservaLabel} ${f.total} ${f.fecha} ${f.estado}`
        .toLowerCase()
        .includes(q);
    });

    this.cdr.detectChanges();
  }

  // ==========================
  // FORM
  // ==========================
  limpiar() {
    this.form.reset({
      cliente_id: null,
      reserva_id: null,
      total: 0,
      fecha: '',
    });
    this.editandoId = null;
    this.cdr.detectChanges();
  }

  editar(f: Factura) {
    this.editandoId = f.id;
    this.form.patchValue({
      cliente_id: f.cliente_id,
      reserva_id: f.reserva_id,
      total: f.total,
      fecha: f.fecha,
    });
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue() as any;
    const payload = {
      cliente_id: Number(v.cliente_id),
      reserva_id: Number(v.reserva_id),
      total: Number(v.total),
      fecha: String(v.fecha),
    };

    this.saving = true;
    this.cdr.detectChanges();

    // UPDATE
    if (this.editandoId !== null) {
      const id = this.editandoId;

      // optimista
      const nuevo: Factura = { id, ...payload } as any;
      this.facturas = this.facturas.map((x) => (x.id === id ? nuevo : x));
      this.rebuildVM();
      this.cdr.detectChanges();

      this.facturasService
        .actualizar(id, payload as any)
        .pipe(finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (resp) => {
            this.facturas = this.facturas.map((x) => (x.id === id ? resp : x));
            this.rebuildVM();
            this.limpiar();
            this.cdr.detectChanges();
          },
          error: (e) => {
            console.error(e);
            this.cargarFacturas();
          },
        });

      return;
    }

    // CREATE
    this.facturasService
      .crear(payload as any)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (resp) => {
          this.facturas = [resp, ...this.facturas];
          this.rebuildVM();
          this.limpiar();
          this.cdr.detectChanges();
        },
        error: (e) => console.error(e),
      });
  }

  eliminar(f: Factura) {
    const ok = confirm(`¿Eliminar factura #${f.id}?`);
    if (!ok) return;

    this.deletingId = f.id;

    const backup = [...this.facturas];
    this.facturas = this.facturas.filter((x) => x.id !== f.id);
    this.rebuildVM();
    this.cdr.detectChanges();

    this.facturasService
      .eliminar(f.id)
      .pipe(finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {},
        error: (e) => {
          console.error(e);
          this.facturas = backup;
          this.rebuildVM();
          this.cdr.detectChanges();
        },
      });
  }

  // ==========================
  // ESTADO FACTURA (VA DE LA MANO CON RESERVA)
  // ==========================
  estadoFactura(reserva_id: number): 'emitida' | 'cancelada' | 'pendiente' {
    const r = this.reservas.find((x) => x.id === reserva_id);
    const est = (r?.estado ?? '').toLowerCase();
    if (est.includes('cancel')) return 'cancelada';
    if (est.includes('confirm')) return 'emitida';
    return 'pendiente';
  }

  badgeFactura(reserva_id: number) {
    const e = this.estadoFactura(reserva_id);
    if (e === 'emitida') return 'srh-b-ok';
    if (e === 'cancelada') return 'srh-b-busy';
    return 'srh-b-warn';
  }

  // ==========================
  // HELPERS
  // ==========================
  nombreCliente(id: number) {
    const c = this.clientes.find((x) => x.id === id);
    return c ? c.nombre : `Cliente #${id}`;
  }

  labelReserva(id: number) {
    const r = this.reservas.find((x) => x.id === id);
    if (!r) return `Reserva #${id}`;
    return `#${r.id} (${r.fecha_inicio} → ${r.fecha_fin})`;
  }

  trackById(_: number, item: FacturaVM) {
    return item.id;
  }

  // ==========================
  // TXT / PDF (NOMBRES COMO TU HTML)
  // ==========================
  descargarTxt(f: Factura) {
    const cliente = this.nombreCliente(f.cliente_id);
    const reserva = this.labelReserva(f.reserva_id);
    const estado = this.estadoFactura(f.reserva_id);

    const contenido =
`SRH - FACTURA #${f.id}
Cliente: ${cliente}
Reserva: ${reserva}
Total: $${f.total}
Fecha: ${f.fecha}
Estado: ${estado}
`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `factura_${f.id}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  imprimirPdf(f: Factura) {
    const cliente = this.nombreCliente(f.cliente_id);
    const reserva = this.labelReserva(f.reserva_id);
    const estado = this.estadoFactura(f.reserva_id);

    const html = `
      <html>
      <head>
        <title>Factura #${f.id}</title>
        <style>
          body{font-family: Arial, sans-serif; padding: 24px;}
          .box{border:1px solid #ddd; padding:16px; border-radius:10px; max-width:600px;}
          h1{margin:0 0 12px 0;}
          .row{margin:6px 0;}
          .k{font-weight:bold;}
        </style>
      </head>
      <body>
        <div class="box">
          <h1>SRH - Factura #${f.id}</h1>
          <div class="row"><span class="k">Cliente:</span> ${cliente}</div>
          <div class="row"><span class="k">Reserva:</span> ${reserva}</div>
          <div class="row"><span class="k">Total:</span> $${f.total}</div>
          <div class="row"><span class="k">Fecha:</span> ${f.fecha}</div>
          <div class="row"><span class="k">Estado:</span> ${estado}</div>
        </div>
        <script>
          window.onload = () => window.print();
        </script>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    }
    }