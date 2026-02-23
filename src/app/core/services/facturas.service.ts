import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Factura } from '../models/factura';

export interface FacturaLite {
  id: number;
  cliente_id?: number;
  reserva_id?: number;
  total?: number;
  fecha?: string;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:8000/api/facturas';

  listar() {
    return this.http.get<Factura[]>(`${this.API_URL}/`);
  }

  crear(payload: Omit<Factura, 'id'>) {
    return this.http.post<Factura>(`${this.API_URL}/`, payload);
  }

  obtener(id: number) {
    return this.http.get<Factura>(`${this.API_URL}/${id}`);
  }

  actualizar(id: number, payload: Partial<Omit<Factura, 'id'>>) {
    return this.http.put<Factura>(`${this.API_URL}/${id}`, payload);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}