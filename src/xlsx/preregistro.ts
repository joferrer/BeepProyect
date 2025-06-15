import * as fs from 'fs';
import * as path from 'path';

import { readPrerregistroArchive } from "./reader"


export const hacerPreregistro = async (): Promise<void> => {
    const data = await readPrerregistroArchive();
    console.log("Preregistro data:", data);
    console.log(data.length, "rows read from the prerregistro archive.");


    // Ruta donde se guardará el JSON
    const outputPath = path.resolve(__dirname, '../../files/preregistro.json');
    // Guardar en el archivo JSON
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
}

