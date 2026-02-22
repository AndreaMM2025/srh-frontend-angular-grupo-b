export interface ClienteCreate {
  nombre: string;
  identificacion: string;
  telefono: string;
  correo: string;
  nacionalidad: string;
}

export interface Cliente extends ClienteCreate {
  id: number;
}