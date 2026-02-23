import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { PagosService } from '../../core/services/pagos.service';
import { FacturasService, FacturaLite } from '../../core/services/facturas.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Pago } from '../../core/models/pago';
import { Cliente } from '../../core/models/cliente';

@Component({
  standalone: true,
  selector: 'app-pagos-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  private fb = inject(FormBuilder);
  private pagosService = inject(PagosService);
  private facturasService = inject(FacturasService);
  private clientesService = inject(ClientesService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  facturas: FacturaLite[] = [];
  clientes: Cliente[] = [];

  loading = false;
  saving = false;
  deletingId: number | null = null;
  editandoId: number | null = null;

  IVA_PORCENTAJE = 0.15; // 15% de IVA

  metodos = [
    { value: 'efectivo', label: '💵 Efectivo' },
    { value: 'debito', label: '💳 Débito' },
    { value: 'tarjeta-mastercard', label: '💳 Mastercard' },
    { value: 'tarjeta-visa', label: '💳 Visa' },
    { value: 'transferencia', label: '🏦 Transferencia' },
    { value: 'otro', label: '📋 Otro' },
  ];

  form = this.fb.group({
    factura_id: [null as any, Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    iva: [0],
    total: [0],
    metodo: ['efectivo', Validators.required],
    fecha: [this.hoyISO(), Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarClientes();
    this.calcularIVA();
  }

  private hoyISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cargarClientes() {
    this.clientesService.listar().subscribe({
      next: (d) => {
        this.clientes = d ?? [];
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
    });
  }

  cargar() {
    this.loading = true;

    this.facturasService.listar().subscribe({
      next: (d) => {
        this.facturas = d ?? [];
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
    });

    this.pagosService
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
            this.pagos = d ?? [];
            this.pagosFiltrados = [...this.pagos];
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.pagos = [];
          this.pagosFiltrados = [];
          this.cdr.detectChanges();
        },
      });
  }

  onBuscar(texto: string) {
    const q = (texto ?? '').toLowerCase().trim();
    if (!q) {
      this.pagosFiltrados = [...this.pagos];
      return;
    }

    this.pagosFiltrados = this.pagos.filter((p) => {
      const facturaInfo = this.facturaConCliente(p.factura_id);
      const base = `${p.id} ${facturaInfo} ${p.monto} ${p.metodo} ${p.fecha} ${p.estado ?? ''}`.toLowerCase();
      return base.includes(q);
    });
  }

  calcularIVA() {
    const montoControl = this.form.get('monto');
    if (montoControl) {
      montoControl.valueChanges.subscribe(monto => {
        const montoNum = Number(monto) || 0;
        const iva = montoNum * this.IVA_PORCENTAJE;
        const total = montoNum + iva;
        
        this.form.patchValue({
          iva: parseFloat(iva.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        }, { emitEvent: false });
      });
    }
  }

  limpiar() {
    this.editandoId = null;
    this.form.reset({
      factura_id: null,
      monto: 0,
      iva: 0,
      total: 0,
      metodo: 'efectivo',
      fecha: this.hoyISO(),
    });
    this.cdr.detectChanges();
  }

  editar(p: Pago) {
    this.editandoId = p.id;
    this.form.patchValue({
      factura_id: p.factura_id as any,
      monto: p.monto,
      iva: (p as any).iva || 0,
      total: (p as any).total || p.monto,
      metodo: p.metodo,
      fecha: p.fecha,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  eliminar(p: Pago) {
    const ok = confirm(`¿Eliminar el pago #${p.id}?`);
    if (!ok) return;

    this.deletingId = p.id;

    this.pagosService
      .eliminar(p.id)
      .pipe(finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => this.cargar(),
        error: (e) => console.error(e),
      });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const v = this.form.getRawValue() as any;
    const payload = {
      factura_id: Number(v.factura_id),
      monto: Number(v.monto),
      iva: Number(v.iva),
      total: Number(v.total),
      metodo: (v.metodo ?? '').trim(),
      fecha: (v.fecha ?? '').trim(),
    };

    if (this.editandoId !== null) {
      this.pagosService
        .actualizar(this.editandoId, payload)
        .pipe(finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: () => {
            this.limpiar();
            this.cargar();
          },
          error: (e) => console.error(e),
        });
      return;
    }

    this.pagosService
      .crear({ ...payload, estado: 'aprobado' } as any)
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.limpiar();
          this.cargar();
        },
        error: (e) => console.error(e),
      });
  }

  facturaConCliente(facturaId: number): string {
    const factura = this.facturas.find(f => f.id === facturaId);
    if (!factura) return `Factura #${facturaId}`;
    
    if (factura.cliente_id) {
      const cliente = this.clientes.find(c => c.id === factura.cliente_id);
      if (cliente) {
        return `${cliente.nombre} (C.I. ${cliente.identificacion})`;
      }
    }
    return `Factura #${factura.id}`;
  }

  mostrarFacturaEnSelect(factura: any): string {
    if (!factura) return '';
    
    const cliente = this.clientes.find(c => c.id === factura.cliente_id);
    const nombreCliente = cliente 
      ? `${cliente.nombre} (C.I. ${cliente.identificacion})`
      : `Cliente #${factura.cliente_id}`;
    
    const total = factura.total != null ? `$${factura.total}` : '';
    const estado = factura.estado ? ` - ${factura.estado}` : '';
    
    return `#${factura.id} - ${nombreCliente} - ${total}${estado}`;
  }

  descargarTXT(pago: Pago) {
    const facturaInfo = this.facturaConCliente(pago.factura_id);
    const iva = this.getIVA(pago);
    const total = this.getTotal(pago);
    
    const contenido = `
COMPROBANTE DE PAGO
====================
ID Pago: ${pago.id}
Fecha: ${pago.fecha}
Factura: ${facturaInfo}

SUBTOTAL:    $${pago.monto.toFixed(2)}
IVA (15%):   $${iva.toFixed(2)}
-------------------
TOTAL:       $${total.toFixed(2)}

Método: ${this.metodoLabel(pago.metodo)}
Estado: ${pago.estado ?? 'aprobado'}
====================
Generado el: ${new Date().toLocaleString('es-ES')}
    `.trim();

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante_pago_${pago.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  descargarPDF(pago: Pago) {
    const facturaInfo = this.facturaConCliente(pago.factura_id);
    const iva = this.getIVA(pago);
    const total = this.getTotal(pago);
    
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .info { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #ccc; padding-top: 10px; }
          .iva { color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>COMPROBANTE DE PAGO</h2>
        </div>
        <div class="info">
          <div class="row"><span>ID Pago:</span><strong>#${pago.id}</strong></div>
          <div class="row"><span>Fecha:</span><span>${pago.fecha}</span></div>
          <div class="row"><span>Factura:</span><span>${facturaInfo}</span></div>
          <div class="row"><span>Método:</span><span>${this.metodoLabel(pago.metodo)}</span></div>
          <div class="row"><span>Estado:</span><span>${pago.estado ?? 'aprobado'}</span></div>
        </div>
        <div class="total">
          <div class="row"><span>Subtotal:</span><span>$${pago.monto.toFixed(2)}</span></div>
          <div class="row iva"><span>IVA (15%):</span><span>$${iva.toFixed(2)}</span></div>
          <div class="row" style="margin-top:10px;font-size:1.3em;color:#2ecc71;">
            <span>TOTAL PAGADO:</span><span>$${total.toFixed(2)}</span>
          </div>
        </div>
        <p style="margin-top:30px;font-size:0.9em;color:#666;">
          Generado el: ${new Date().toLocaleString('es-ES')}
        </p>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.onload = () => {
        ventana.print();
      };
    } else {
      alert('⚠️ Permite las ventanas emergentes para descargar el PDF');
    }
  }

  metodoLabel(v: string) {
    return this.metodos.find((m) => m.value === v)?.label ?? v;
  }

  trackById(_: number, p: Pago) {
    return p.id;
  }

  // ✅ MÉTODOS PARA EL TEMPLATE
  getIVA(pago: Pago): number {
    const p = pago as any;
    return p.iva || (pago.monto * 0.15);
  }

  getTotal(pago: Pago): number {
    const p = pago as any;
    const iva = this.getIVA(pago);
    return p.total || (pago.monto + iva);
  }

  getEstadoClass(estado: string | null | undefined): string {
    if (!estado || estado.toLowerCase() === 'aprobado') {
      return 'bg-success';
    }
    if (estado.toLowerCase() === 'anulado') {
      return 'bg-danger';
    }
    return 'bg-secondary';
  }
}