import fs from 'fs';
import path from 'path';
import { AsistenciaLocal, AsistenteData } from '../../interfaces';

const filePath = path.join(__dirname, '../../../files/asistencias.json');

export const guardarAsistenciaLocal = async (rfid: string,mesa:string,cedula="") => {
  const nuevaAsistencia = {
    mesa,
    rfid,
    cedula: cedula || undefined, // Si no se proporciona nombre, se deja como undefined
    fecha: new Date().toISOString(), // fecha en formato ISO
  };

  try {
    let asistencias: any[] = [];

    // Si el archivo existe, lo leemos y parseamos
    if (fs.existsSync(filePath)) {
      const contenido = await fs.promises.readFile(filePath, 'utf-8');
      asistencias = JSON.parse(contenido);
    }

    // Agregamos la nueva asistencia
    asistencias.push(nuevaAsistencia);

    // Guardamos el arreglo actualizado
    await fs.promises.writeFile(filePath, JSON.stringify(asistencias, null, 2), 'utf-8');

    return true;
  } catch (error) {
    console.error('Error al guardar asistencia local:', error);
    return false;
  }
};

export const obtenerAsistenciasLocales = async (): Promise<AsistenciaLocal[] > => {
    try {
        if (fs.existsSync(filePath)) {
        const contenido = await fs.promises
            .readFile(filePath, 'utf-8');
        return JSON.parse(contenido);
        } else {    
            console.log('No hay asistencias locales registradas.');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener asistencias locales:', error);
        return [];
    }
}

export const registrarErroresEnElCargadoDeAsistencias = async (errores: AsistenciaLocal[]) => {
    const errorFilePath = path.join(__dirname, '../../../files/errores_asistencias.json');
    
    try {
        // Si el archivo de errores no existe, lo creamos
        if (!fs.existsSync(errorFilePath)) {
        await fs.promises.writeFile(errorFilePath, JSON.stringify([], null, 2), 'utf-8');
        }
    
        // Leemos el contenido actual del archivo
        const contenido = await fs.promises.readFile(errorFilePath, 'utf-8');
        const erroresActuales = JSON.parse(contenido);
    
        // Agregamos los nuevos errores
        erroresActuales.push(...errores);
    
        // Guardamos el arreglo actualizado
        await fs.promises.writeFile(errorFilePath, JSON.stringify(erroresActuales, null, 2), 'utf-8');
    
        console.log('Errores registrados exitosamente.');
    } catch (error) {
        console.error('Error al registrar errores:', error);
    }
}

function obtenerAsistentesFrecuentes(asistentes: AsistenteData[]): string[] {
  const mesasExcluidas = [
    "Ruleta de la Calidad",
    "Dale la vuelta a la Calidad",
    "Vibra con el Tejo",
    "Fútbol en Tela"
  ];

  return asistentes
    .filter(asistente => {
      const asistenciasValidas = asistente.ASISTENCIA?.filter(
        a => !mesasExcluidas.includes(a.mesa)
      ) || [];

      return asistenciasValidas.length > 6;
    })
    .map(asistente => asistente.NOMBRE_Y_APELLIDOS);
}

export async function guardarAsistentesFrecuentesEnTxt(asistentes: AsistenteData[]) {
  try {
    const nombresFrecuentes = obtenerAsistentesFrecuentes(asistentes);
    const contenido = nombresFrecuentes.join('\n');
    const ruta = path.resolve(__dirname, '../../../files/asistentes_frecuentes.txt');
    await fs.promises.writeFile(ruta, contenido, 'utf-8');
    console.log(`Archivo guardado en: ${ruta}`);
  } catch (error) {
    console.error('Error al guardar el archivo de asistentes frecuentes:', error);
  }
}