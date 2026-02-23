import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:8000/api/pagos';

  listar() {
    return this.http.get<Pago[]>(`${this.API_URL}`);
  }

  crear(payload: Omit<Pago, 'id'>) {
    return this.http.post<Pago>(`${this.API_URL}`, payload);
  }

  actualizar(id: number, payload: Partial<Omit<Pago, 'id'>>) {
    return this.http.put<Pago>(`${this.API_URL}/${id}`, payload);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}