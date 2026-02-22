import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../models/reserva';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:8000/api/reservas';

  listar() {
    return this.http.get<Reserva[]>(`${this.API_URL}/`);
  }

  crear(payload: Omit<Reserva, 'id' | 'estado'> & Partial<Pick<Reserva, 'estado'>>) {
    return this.http.post<Reserva>(`${this.API_URL}/`, payload);
  }

  confirmar(id: number) {
    return this.http.put<Reserva>(`${this.API_URL}/${id}/confirmar`, {});
  }

  cancelar(id: number) {
    return this.http.put<Reserva>(`${this.API_URL}/${id}/cancelar`, {});
  }
}