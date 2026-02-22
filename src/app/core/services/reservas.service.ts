import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/reservas';

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/`);
  }

  crear(payload: Partial<Reserva>): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}/`, payload);
  }

  actualizar(id: number, payload: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  confirmar(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}/confirmar`, {});
  }

  cancelar(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}