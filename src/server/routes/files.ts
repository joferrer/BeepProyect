import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../../../files/asistencias.json');

export const guardarAsistenciaLocal = async (rfid: string,mesa:string) => {
  const nuevaAsistencia = {
    mesa,
    rfid,
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
