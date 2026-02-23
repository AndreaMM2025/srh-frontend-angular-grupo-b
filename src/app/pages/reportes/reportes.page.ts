import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ReportesService } from '../../core/services/reportes.service';
import {
  ReporteIngresos,
  ReporteCliente,
  ReporteHabitaciones,
  ReporteFacturas,
  ReporteReservas,
  ReporteGeneral
} from '../../core/models/reporte';

@Component({
  standalone: true,
  selector: 'app-reportes-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage implements OnInit {
  private fb = inject(FormBuilder);
  private reportesService = inject(ReportesService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // Datos de reportes
  reporteIngresos: ReporteIngresos | null = null;
  reporteClientes: ReporteCliente[] = [];
  reporteHabitaciones: ReporteHabitaciones | null = null;
  reporteFacturas: ReporteFacturas | null = null;
  reporteReservas: ReporteReservas | null = null;
  reporteGeneral: ReporteGeneral | null = null;

  loading = false;
  activeTab = 'general';

  // Filtros de fecha
  fechaInicio = '';
  fechaFin = '';

  form = this.fb.group({
    fechaInicio: [''],
    fechaFin: [''],
  });

  ngOnInit(): void {
    this.cargarReporteGeneral();
  }

  // ==========================
  // CARGA RÁPIDA DE REPORTES
  // ==========================
  cargarReporteGeneral() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getGeneral()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteGeneral = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  cargarIngresos() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getIngresos(this.fechaInicio, this.fechaFin)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteIngresos = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  cargarClientes() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getClientes()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteClientes = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  cargarHabitaciones() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getHabitaciones()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteHabitaciones = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  cargarFacturas() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getFacturas(this.fechaInicio, this.fechaFin)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteFacturas = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  cargarReservas() {
    this.loading = true;
    this.cdr.detectChanges();

    this.reportesService.getReservas(this.fechaInicio, this.fechaFin)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.reporteReservas = data;
            this.cdr.detectChanges();
          });
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ==========================
  // GENERAR TXT
  // ==========================
  generarTXT(tipo: string) {
    const fechaHora = new Date().toLocaleString('es-ES');
    let contenido = '';
    let nombreArchivo = '';

    switch (tipo) {
      case 'general':
        contenido = this.generarTXTGeneral(fechaHora);
        nombreArchivo = 'reporte_general';
        break;
      case 'ingresos':
        contenido = this.generarTXTIngresos(fechaHora);
        nombreArchivo = 'reporte_ingresos';
        break;
      case 'clientes':
        contenido = this.generarTXTClientes(fechaHora);
        nombreArchivo = 'reporte_clientes';
        break;
      case 'habitaciones':
        contenido = this.generarTXTHabitaciones(fechaHora);
        nombreArchivo = 'reporte_habitaciones';
        break;
      case 'facturas':
        contenido = this.generarTXTFacturas(fechaHora);
        nombreArchivo = 'reporte_facturas';
        break;
      case 'reservas':
        contenido = this.generarTXTReservas(fechaHora);
        nombreArchivo = 'reporte_reservas';
        break;
    }

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}_${this.getFechaHora()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generarTXTGeneral(fechaHora: string): string {
    return `
SRH - REPORTE GENERAL DEL SISTEMA
==================================
Generado: ${fechaHora}

RESUMEN GENERAL
---------------
TOTAL CLIENTES: ${this.reporteGeneral?.resumen.total_clientes}
TOTAL HABITACIONES: ${this.reporteGeneral?.resumen.total_habitaciones}
TOTAL RESERVAS: ${this.reporteGeneral?.resumen.total_reservas}
TOTAL FACTURAS: ${this.reporteGeneral?.resumen.total_facturas}
TOTAL PAGOS: ${this.reporteGeneral?.resumen.total_pagos}

INGRESOS TOTALES
----------------
TOTAL RECAUDADO: $${this.reporteGeneral?.ingresos.total_recaudado.toFixed(2)}
==================================
    `.trim();
  }

  private generarTXTIngresos(fechaHora: string): string {
    return `
SRH - REPORTE DE INGRESOS
==========================
Generado: ${fechaHora}
Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}

TOTAL RECAUDADO: $${this.reporteIngresos?.total_recaudado.toFixed(2)}
TOTAL FACTURAS: ${this.reporteIngresos?.total_facturas}
TOTAL PAGOS: ${this.reporteIngresos?.total_pagos}
==========================
    `.trim();
  }

  private generarTXTClientes(fechaHora: string): string {
    let contenido = `
SRH - REPORTE DE CLIENTES
==========================
Generado: ${fechaHora}

`;
    this.reporteClientes.forEach(cliente => {
      contenido += `
CLIENTE: ${cliente.cliente_nombre}
Identificación: ${cliente.cliente_identificacion}
Total Reservas: ${cliente.total_reservas}
Total Facturas: ${cliente.total_facturas}
Total Pagado: $${cliente.total_pagado.toFixed(2)}
--------------------------
`;
    });
    return contenido;
  }

  private generarTXTHabitaciones(fechaHora: string): string {
    return `
SRH - REPORTE DE HABITACIONES
==============================
Generado: ${fechaHora}

TOTAL HABITACIONES: ${this.reporteHabitaciones?.total_habitaciones}
DISPONIBLES: ${this.reporteHabitaciones?.habitaciones_disponibles}
OCUPADAS: ${this.reporteHabitaciones?.habitaciones_ocupadas}
% OCUPACIÓN: ${this.reporteHabitaciones?.porcentaje_ocupacion}%
==============================
    `.trim();
  }

  private generarTXTFacturas(fechaHora: string): string {
    return `
SRH - REPORTE DE FACTURAS
==========================
Generado: ${fechaHora}
Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}

TOTAL FACTURAS: ${this.reporteFacturas?.total_facturas}
TOTAL MONTOS: $${this.reporteFacturas?.total_monto.toFixed(2)}
EMITIDAS: ${this.reporteFacturas?.facturas_emitidas}
PENDIENTES: ${this.reporteFacturas?.facturas_pendientes}
CANCELADAS: ${this.reporteFacturas?.facturas_canceladas}
==========================
    `.trim();
  }

  private generarTXTReservas(fechaHora: string): string {
    return `
SRH - REPORTE DE RESERVAS
==========================
Generado: ${fechaHora}
Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}

TOTAL RESERVAS: ${this.reporteReservas?.total_reservas}
CONFIRMADAS: ${this.reporteReservas?.reservas_confirmadas}
PENDIENTES: ${this.reporteReservas?.reservas_pendientes}
CANCELADAS: ${this.reporteReservas?.reservas_canceladas}
==========================
    `.trim();
  }

  // ==========================
  // GENERAR PDF
  // ==========================
  generarPDF(tipo: string) {
    switch (tipo) {
      case 'general':
        this.generarPDFGeneral();
        break;
      case 'ingresos':
        this.generarPDFIngresos();
        break;
      case 'clientes':
        this.generarPDFClientes();
        break;
      case 'habitaciones':
        this.generarPDFHabitaciones();
        break;
      case 'facturas':
        this.generarPDFFacturas();
        break;
      case 'reservas':
        this.generarPDFReservas();
        break;
    }
  }

  private generarPDFGeneral() {
    const fechaHora = new Date().toLocaleString('es-ES');
    
    const html = `
      <html>
      <head>
        <title>Reporte General del Sistema</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .card { border: 1px solid #ddd; padding: 20px; border-radius: 10px; text-align: center; }
          .card h3 { margin: 0 0 10px 0; color: #666; font-size: 1em; }
          .card .value { font-size: 2.5em; font-weight: bold; color: #4CAF50; }
          .card.blue .value { color: #2196F3; }
          .card.green .value { color: #4CAF50; }
          .card.orange .value { color: #FF9800; }
          .card.red .value { color: #F44336; }
          .card.purple .value { color: #9C27B0; }
          .total-section { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px; text-align: center; }
          .total-section h2 { color: #4CAF50; font-size: 2.5em; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SRH - Reporte General del Sistema</h1>
        </div>
        <div class="fecha">Generado: ${fechaHora}</div>
        
        <h2 style="margin-bottom: 20px;">📊 Resumen General</h2>
        <div class="summary">
          <div class="card blue">
            <h3>👥 Total Clientes</h3>
            <div class="value">${this.reporteGeneral?.resumen.total_clientes}</div>
          </div>
          <div class="card green">
            <h3>🏨 Total Habitaciones</h3>
            <div class="value">${this.reporteGeneral?.resumen.total_habitaciones}</div>
          </div>
          <div class="card orange">
            <h3>📅 Total Reservas</h3>
            <div class="value">${this.reporteGeneral?.resumen.total_reservas}</div>
          </div>
          <div class="card purple">
            <h3>🧾 Total Facturas</h3>
            <div class="value">${this.reporteGeneral?.resumen.total_facturas}</div>
          </div>
          <div class="card red">
            <h3>💵 Total Pagos</h3>
            <div class="value">${this.reporteGeneral?.resumen.total_pagos}</div>
          </div>
        </div>
        
        <div class="total-section">
          <h3>💰 Total Recaudado</h3>
          <h2>$${this.reporteGeneral?.ingresos.total_recaudado.toFixed(2)}</h2>
        </div>
        
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    
    this.abrirVentanaPDF(html, 'Reporte General del Sistema');
  }

  private generarPDFIngresos() {
    const fechaHora = new Date().toLocaleString('es-ES');
    const html = `
      <html>
      <head>
        <title>Reporte de Ingresos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          .card { border: 1px solid #ddd; padding: 16px; border-radius: 10px; margin: 10px 0; background: #f9f9f9; }
          .total { font-size: 2em; color: #2ecc71; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SRH - Reporte de Ingresos</h1>
        </div>
        <div class="fecha">Generado: ${fechaHora}<br>Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}</div>
        
        <div class="card">
          <div class="row">
            <span class="label">Total Recaudado:</span>
            <span class="total">$${this.reporteIngresos?.total_recaudado.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">Total Facturas:</span>
            <span>${this.reporteIngresos?.total_facturas}</span>
          </div>
          <div class="row">
            <span class="label">Total Pagos:</span>
            <span>${this.reporteIngresos?.total_pagos}</span>
          </div>
        </div>
        
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    this.abrirVentanaPDF(html, 'Reporte de Ingresos');
  }

  private generarPDFClientes() {
    const fechaHora = new Date().toLocaleString('es-ES');
    let rows = '';
    this.reporteClientes.forEach(c => {
      rows += `
        <tr>
          <td>${c.cliente_nombre}</td>
          <td>${c.cliente_identificacion}</td>
          <td>${c.total_reservas}</td>
          <td>${c.total_facturas}</td>
          <td style="color: #2ecc71; font-weight: bold;">$${c.total_pagado.toFixed(2)}</td>
        </tr>`;
    });

    const html = `
      <html>
      <head>
        <title>Reporte de Clientes</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header"><h1>SRH - Reporte de Clientes</h1></div>
        <div class="fecha">Generado: ${fechaHora}</div>
        <table>
          <thead>
            <tr><th>Cliente</th><th>Identificación</th><th>Reservas</th><th>Facturas</th><th>Total Pagado</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    this.abrirVentanaPDF(html, 'Reporte de Clientes');
  }

  private generarPDFHabitaciones() {
    const fechaHora = new Date().toLocaleString('es-ES');
    let rows = '';
    this.reporteHabitaciones?.habitaciones.forEach(h => {
      const color = h.estado === 'Disponible' ? '#2ecc71' : '#e74c3c';
      rows += `
        <tr>
          <td>${h.numero}</td>
          <td>${h.tipo}</td>
          <td>$${h.precio}</td>
          <td style="color: ${color}; font-weight: bold;">${h.estado}</td>
          <td>${h.reservas_activas}</td>
        </tr>`;
    });

    const html = `
      <html>
      <head>
        <title>Reporte de Habitaciones</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          .summary { display: flex; gap: 20px; margin-bottom: 20px; }
          .summary-card { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header"><h1>SRH - Reporte de Habitaciones</h1></div>
        <div class="fecha">Generado: ${fechaHora}</div>
        <div class="summary">
          <div class="summary-card"><strong>Total</strong><br>${this.reporteHabitaciones?.total_habitaciones}</div>
          <div class="summary-card"><strong>Disponibles</strong><br>${this.reporteHabitaciones?.habitaciones_disponibles}</div>
          <div class="summary-card"><strong>Ocupadas</strong><br>${this.reporteHabitaciones?.habitaciones_ocupadas}</div>
          <div class="summary-card"><strong>% Ocupación</strong><br>${this.reporteHabitaciones?.porcentaje_ocupacion}%</div>
        </div>
        <table>
          <thead><tr><th>Número</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Reservas Activas</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    this.abrirVentanaPDF(html, 'Reporte de Habitaciones');
  }

  private generarPDFFacturas() {
    const fechaHora = new Date().toLocaleString('es-ES');
    let rows = '';
    this.reporteFacturas?.facturas.forEach(f => {
      let color = '#95a5a6';
      if (f.estado === 'emitida') color = '#2ecc71';
      else if (f.estado === 'pendiente') color = '#f39c12';
      else if (f.estado === 'cancelada') color = '#e74c3c';
      
      rows += `
        <tr>
          <td>#${f.factura_id}</td>
          <td>${f.cliente}</td>
          <td style="color: #2ecc71; font-weight: bold;">$${f.total}</td>
          <td>${f.fecha}</td>
          <td style="color: ${color}; font-weight: bold;">${f.estado}</td>
        </tr>`;
    });

    const html = `
      <html>
      <head>
        <title>Reporte de Facturas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header"><h1>SRH - Reporte de Facturas</h1></div>
        <div class="fecha">Generado: ${fechaHora}<br>Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}</div>
        <table>
          <thead><tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    this.abrirVentanaPDF(html, 'Reporte de Facturas');
  }

  private generarPDFReservas() {
    const fechaHora = new Date().toLocaleString('es-ES');
    let rows = '';
    this.reporteReservas?.reservas.forEach(r => {
      let color = '#95a5a6';
      if (r.estado === 'confirmada') color = '#2ecc71';
      else if (r.estado === 'pendiente') color = '#f39c12';
      else if (r.estado === 'cancelada') color = '#e74c3c';
      
      rows += `
        <tr>
          <td>#${r.reserva_id}</td>
          <td>${r.cliente}</td>
          <td>${r.habitacion}</td>
          <td>${r.fecha_inicio}</td>
          <td style="color: ${color}; font-weight: bold;">${r.estado}</td>
        </tr>`;
    });

    const html = `
      <html>
      <head>
        <title>Reporte de Reservas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header"><h1>SRH - Reporte de Reservas</h1></div>
        <div class="fecha">Generado: ${fechaHora}<br>Período: ${this.fechaInicio || 'Todos'} a ${this.fechaFin || 'Todos'}</div>
        <table>
          <thead><tr><th>Reserva</th><th>Cliente</th><th>Habitación</th><th>Inicio</th><th>Estado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `;
    this.abrirVentanaPDF(html, 'Reporte de Reservas');
  }

  private abrirVentanaPDF(html: string, titulo: string) {
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) {
      alert('⚠️ Permite las ventanas emergentes para descargar el PDF');
      return;
    }
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
  }

  private getFechaHora(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  // ==========================
  // CAMBIAR TAB Y CARGAR
  // ==========================
  setActiveTab(tab: string) {
    this.activeTab = tab;
    switch (tab) {
      case 'general':
        this.cargarReporteGeneral();
        break;
      case 'ingresos':
        this.cargarIngresos();
        break;
      case 'clientes':
        this.cargarClientes();
        break;
      case 'habitaciones':
        this.cargarHabitaciones();
        break;
      case 'facturas':
        this.cargarFacturas();
        break;
      case 'reservas':
        this.cargarReservas();
        break;
    }
  }

  aplicarFiltros() {
    this.fechaInicio = this.form.value.fechaInicio || '';
    this.fechaFin = this.form.value.fechaFin || '';
    
    // Recargar el reporte activo con los nuevos filtros
    this.setActiveTab(this.activeTab);
  }

  limpiarFiltros() {
    this.form.reset({
      fechaInicio: '',
      fechaFin: '',
    });
    this.fechaInicio = '';
    this.fechaFin = '';
    
    // Recargar sin filtros
    this.setActiveTab(this.activeTab);
  }

  // ==========================
  // ✅ LIMPIAR TODOS LOS DATOS (NUEVO)
  // ==========================
  limpiarTodo() {
    const confirmacion = confirm(
      '⚠️ ¡ATENCIÓN! ¿Estás SEGURO de que quieres eliminar TODOS los datos del sistema?\n\n' +
      'Esto eliminará:\n' +
      '• Todos los clientes\n' +
      '• Todas las habitaciones\n' +
      '• Todas las reservas\n' +
      '• Todas las facturas\n' +
      '• Todos los pagos\n\n' +
      'Esta acción NO se puede deshacer.'
    );
    
    if (!confirmacion) return;
    
    const confirmacion2 = confirm(
      '⚠️ ÚLTIMA ADVERTENCIA\n\n' +
      '¿Realmente deseas continuar? Escribe "SI" para confirmar.\n\n' +
      '(Nota: Esto es una medida de seguridad adicional)'
    );
    
    if (!confirmacion2) return;
    
    this.loading = true;
    this.cdr.detectChanges();
    
    this.reportesService.limpiarTodo()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          alert('✅ ' + data.message + '\n\n' + 
                'Clientes eliminados: ' + data.estadisticas.clientes_eliminados + '\n' +
                'Habitaciones eliminadas: ' + data.estadisticas.habitaciones_eliminadas + '\n' +
                'Reservas eliminadas: ' + data.estadisticas.reservas_eliminadas + '\n' +
                'Facturas eliminadas: ' + data.estadisticas.facturas_eliminadas + '\n' +
                'Pagos eliminados: ' + data.estadisticas.pagos_eliminados);
          
          // Recargar el reporte general
          this.cargarReporteGeneral();
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error(e);
          alert('❌ Error al limpiar los datos: ' + (e.error?.detail || 'Error desconocido'));
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}