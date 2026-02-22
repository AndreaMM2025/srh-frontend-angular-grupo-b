
export interface Reserva {
  id: number;
  cliente_id: number;
  habitacion_id: number;
  fecha_inicio: string; // "YYYY-MM-DD"
  fecha_fin: string;    // "YYYY-MM-DD"
  estado: string;       // "pendiente" | "confirmada" | "cancelada"
}