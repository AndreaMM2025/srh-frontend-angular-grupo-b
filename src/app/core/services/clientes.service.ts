import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/clientes';

  listar(q?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<Cliente[]>(`${this.baseUrl}/`, { params });
  }

  crear(payload: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/`, payload);
  }

  actualizar(id: number, payload: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}