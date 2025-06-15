import fs from 'fs/promises';
import path from 'path';
import { subirDatos } from './db'; // Ajusta si tu función está en otro archivo
import { PreregistroData } from '../interfaces'; // Ajusta si tienes una interfaz/tipo definido

export const hacerPreregistro = async (): Promise<void> => {
  try {
    const filePath = path.resolve(__dirname, '../../files/preregistro.json');
    const contenido = await fs.readFile(filePath, 'utf-8');
    const datos: PreregistroData[] = JSON.parse(contenido);

    // Elimina el atributo "NÚMERO" de cada objeto
    const datosLimpios = datos.map(({ NUMERO, ...rest }) => rest);

    const todoOk = await subirDatos(datosLimpios);

    if (todoOk) {
      console.log('🎉 Prerregistro exitoso: todos los datos fueron subidos');
    } else {
      console.log('⚠️ Prerregistro parcial: algunos datos no pudieron subirse');
    }

  } catch (err) {
    console.error('❌ Error al hacer el prerregistro:', (err as Error).message);
  }
};
