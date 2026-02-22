import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Habitacion } from '../models/habitacion';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private http = inject(HttpClient);

  private API_URL = 'http://localhost:8000/api/habitaciones';

  listar() {
    return this.http.get<Habitacion[]>(`${this.API_URL}`);
  }

  crear(payload: Omit<Habitacion, 'id'>) {
    return this.http.post<Habitacion>(`${this.API_URL}`, payload);
  }

  obtener(id: number) {
    return this.http.get<Habitacion>(`${this.API_URL}/${id}`);
  }

  actualizar(id: number, payload: Omit<Habitacion, 'id'>) {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}`, payload);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}