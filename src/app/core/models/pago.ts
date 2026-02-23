export interface Pago {
  id: number;
  factura_id: number;
  monto: number;
  metodo: string;   // "efectivo" | "debito" | "tarjeta-mastercard" | ...
  fecha: string;    // "YYYY-MM-DD"
  estado: string;   // "aprobado" | "anulado" | ...
}