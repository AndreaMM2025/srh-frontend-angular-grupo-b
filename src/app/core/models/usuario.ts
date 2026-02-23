// src/app/core/models/usuario.ts

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  password?: string;
  rol: 'admin' | 'manager' | 'recepcionista';
  email?: string;
  estado: boolean;
}