export interface Factura {
  id: number;
  cliente_id: number;
  reserva_id: number;
  total: number;
  fecha: string; // "YYYY-MM-DD"
  estado: string; // pendiente, cancelado, emitida
}