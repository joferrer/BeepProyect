const XlsxPopulate = require('xlsx-populate'); // sin tipos
import * as path from 'path'


const readXlsxData = async (filePath: string): Promise<any[][]> => {
    try {
        // Load the workbook from the file path
        const workbook = await XlsxPopulate.fromFileAsync(filePath);
        // Get the first sheet
        const sheet = workbook.sheet(0);
        // Return the data as a 2D array
        return sheet.usedRange().value() as any[][];
    } catch (error) {
        console.error('Error reading XLSX data:', error);
        throw error;
    }
}


export const readPrerregistroArchive = async (): Promise<any[]> => {
    const filePath = path.resolve(__dirname, '../../files/pre.xlsx');
    try {
        // Read the data from the XLSX file
        const data = await readXlsxData(filePath);
        //console.log('Prerregistro data read successfully:', data[1]);
        // Convert the data to an array of objects
        const headers = data[1];
        return data.slice(2).
            filter(row => {
                // Si al menos una de las primeras 5 celdas NO es null/undefined/'' (vacía), se conserva la fila
                return row.slice(0, 5).some(cell => cell !== undefined && cell !== null && cell !== '');
            })
            .map(row => {
                return row.reduce((obj, value, index) => {
                    if (index < 5) {
                        obj[
                            headers[index].trim()
                                .normalize("NFD")                      // Descompone tildes
                                .replace(/[\u0300-\u036f]/g, "")      // Quita tildes
                                .replace(/\s+/g, "_")                 // Reemplaza espacios por guiones bajos
                        ] = value;
                    }
                    return obj;
                }, {});
            });
    } catch (error) {
        console.error('Error reading prerregistro archive:', error);
        throw error;
    }
}