import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Cliente, ClienteCreate } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private url = `${environment.apiUrl}/api/clientes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  crear(data: any) {
    console.log('ENVIANDO A API:', data);
    return this.http.post(this.url, data);
}
}