import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReporteIngresos,
  ReporteCliente,
  ReporteHabitaciones,
  ReporteFacturas,
  ReporteReservas,
  ReporteGeneral
} from '../models/reporte';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:8000/api/reportes';

  constructor(private http: HttpClient) {}

  // Reporte de Ingresos
  getIngresos(fechaInicio?: string, fechaFin?: string): Observable<ReporteIngresos> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ReporteIngresos>(`${this.apiUrl}/ingresos`, { params });
  }

  // Reporte de Clientes
  getClientes(): Observable<ReporteCliente[]> {
    return this.http.get<ReporteCliente[]>(`${this.apiUrl}/clientes`);
  }

  // Reporte de Habitaciones
  getHabitaciones(): Observable<ReporteHabitaciones> {
    return this.http.get<ReporteHabitaciones>(`${this.apiUrl}/habitaciones`);
  }

  // Reporte de Facturas
  getFacturas(fechaInicio?: string, fechaFin?: string): Observable<ReporteFacturas> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ReporteFacturas>(`${this.apiUrl}/facturas`, { params });
  }

  // Reporte de Reservas
  getReservas(fechaInicio?: string, fechaFin?: string): Observable<ReporteReservas> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ReporteReservas>(`${this.apiUrl}/reservas`, { params });
  }

  // Reporte General
  getGeneral(): Observable<ReporteGeneral> {
    return this.http.get<ReporteGeneral>(`${this.apiUrl}/general`);
  }

  // ✅ LIMPIAR TODOS LOS DATOS (NUEVO)
  limpiarTodo(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/limpiar-todo`);
  }

  // Generar TXT
  generarTXT(contenido: string, nombreArchivo: string) {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}_${this.getFechaHora()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Generar PDF (simulado con ventana de impresión)
  generarPDF(contenidoHTML: string, titulo: string) {
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) return;

    ventana.document.write(`
      <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .fecha { text-align: right; color: #666; font-size: 0.9em; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; color: #4CAF50; }
        </style>
      </head>
      <body>
        ${contenidoHTML}
        <script>
          window.onload = () => { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  }

  private getFechaHora(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }
}