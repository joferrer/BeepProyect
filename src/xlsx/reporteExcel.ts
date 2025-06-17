

// src/utils/leerAsistenciasLocales.ts
import { promises as fs } from 'fs';
import path from 'path';
import { AsistenciaLocal, AsistenteData } from '../interfaces';
import * as XLSX from 'xlsx';


export async function leerAsistenciasLocales(): Promise<AsistenciaLocal[]> {
  const rutaArchivo = path.resolve(__dirname, '../../files/asistencias.json');

  try {
    const contenido = await fs.readFile(rutaArchivo, 'utf-8');
    const asistencias: AsistenciaLocal[] = JSON.parse(contenido);
    return asistencias;
  } catch (error) {
    console.error('Error al leer asistencias locales:', error);
    return [];
  }
}


// src/utils/generarExcelAsistentes.ts

export async function generarExcelAsistentes(asistentes: AsistenteData[], nombreArchivo = 'asistencias.xlsx') {
  const filas = asistentes.flatMap((asistente) =>
    (asistente.ASISTENCIA || []).map((asistencia) => ({
      NOMBRE_Y_APELLIDOS: asistente.NOMBRE_Y_APELLIDOS,
      CEDULA: asistente.CEDULA,
      AREA_O_DEPENDENCIA: asistente.AREA_O_DEPENDENCIA,
      CORREO: asistente.CORREO || '',
      MESA: asistencia.mesa,
      FECHA: formatearFechaYHora(asistencia.fecha)// Solo fecha YYYY-MM-DD
    }))
  );

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Asistencias');

  const buffer = XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' });

  const rutaSalida = path.resolve(__dirname, `../../files/${nombreArchivo}`);
  await fs.writeFile(rutaSalida, buffer);

  console.log(`Excel generado en: ${rutaSalida}`);
}

type FechaFirestore = {
  _seconds: number;
  _nanoseconds: number;
};

function formatearFechaYHora(fechaInput: string | Date | FechaFirestore): string {
  console.log("Fecha original:", fechaInput);

  let fecha: Date;

  if (typeof fechaInput === 'object' && '_seconds' in fechaInput) {
    // Timestamp de Firestore
    fecha = new Date(fechaInput._seconds * 1000);
  } else {
    fecha = new Date(fechaInput);
  }

  if (isNaN(fecha.getTime())) {
    throw new Error("Fecha inválida");
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = fecha.getFullYear();
  const month = pad(fecha.getMonth() + 1);
  const day = pad(fecha.getDate());
  const hours = pad(fecha.getHours());
  const minutes = pad(fecha.getMinutes());
  const seconds = pad(fecha.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
