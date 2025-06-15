

export interface PreregistroData {
  NUMERO: number;
  NOMBRE_Y_APELLIDOS: string;
  CEDULA: number | string;
  AREA_O_DEPENDENCIA: string;
  CORREO?: string;
  RFID?: string;
}

export interface AsistenciaData {
  fecha: Date; // Formato YYYY-MM-DD
  mesa: string; // Identificador de la mesa
}

export interface AsistenciaLocal {
  mesa: string; // Identificador de la mesa
  rfid?: string; // Identificador RFID del asistente
  fecha: string; // Fecha en formato ISO
  nombre?: string; // Nombre del asistente, opcional
}

export interface AsistenteData extends Omit<PreregistroData, 'NUMERO'> {
  id?: string; // Opcional para el ID del documento en la base de datos
  ASISTENCIA?: AsistenciaData[]; // Lista de asistencias
}