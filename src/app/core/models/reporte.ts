export interface ReporteIngresos {
  total_recaudado: number;
  total_facturas: number;
  total_pagos: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ReporteCliente {
  cliente_id: number;
  cliente_nombre: string;
  cliente_identificacion: string;
  total_reservas: number;
  total_facturas: number;
  total_pagado: number;
  reservas: any[];
}

export interface ReporteHabitaciones {
  total_habitaciones: number;
  habitaciones_disponibles: number;
  habitaciones_ocupadas: number;
  porcentaje_ocupacion: number;
  habitaciones: any[];
}

export interface ReporteFacturas {
  total_facturas: number;
  total_monto: number;
  facturas_emitidas: number;
  facturas_pendientes: number;
  facturas_canceladas: number;
  facturas: any[];
}

export interface ReporteReservas {
  total_reservas: number;
  reservas_confirmadas: number;
  reservas_pendientes: number;
  reservas_canceladas: number;
  reservas: any[];
}

export interface ReporteGeneral {
  fecha_generacion: string;
  resumen: {
    total_clientes: number;
    total_habitaciones: number;
    total_reservas: number;
    total_facturas: number;
    total_pagos: number;
  };
  ingresos: {
    total_recaudado: number;
  };
}