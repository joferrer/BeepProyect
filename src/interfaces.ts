

export interface PreregistroData {
  NUMERO: number;
  NOMBRE_Y_APELLIDOS: string;
  CEDULA: number | string;
  AREA_O_DEPENDENCIA: string;
  CORREO?: string;
  RFID?: string;
}

export interface AsistenciaData {
  fecha: string; // Formato YYYY-MM-DD
  mesa: string; // Identificador de la mesa
}

export interface AsistenteData extends Omit<PreregistroData, 'NUMERO'> {
  id?: string; // Opcional para el ID del documento en la base de datos
}