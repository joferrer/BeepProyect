import { AsistenteData, PreregistroData } from "../interfaces";
import { database as db } from "./config"

const collectionRef = db.collection('asistentes');


export const subirDatos = async (datos: Omit<PreregistroData, 'NUMERO'>[]) => {
    
    let huboError = false;
     let exitos = 0;
     let fallidos = 0;
    for (const persona of datos) {
        await collectionRef.add(persona)
            .then(() => {
                exitos++;
            })
            .catch((error) => {
                console.error('Error al subir los datos:', error);
                huboError = true;
                fallidos++;
            })
    }
    console.log(`Datos subidos exitosamente: ${exitos}`);
    console.log(`Datos fallidos al subir: ${fallidos}`);
    return !huboError
};

export const registrarAsistente = async (persona: PreregistroData) => {
    
    try {
        const docRef = await collectionRef.add(persona);
        console.log('Asistente registrado con ID:', docRef.id);
        return true; // Retorna el ID del documento creado
    } catch (error) {
        console.error('Error al registrar asistente:', error);
        return false; // Retorna false en caso de error
    }
}

export const obtenerAsistentes = async () => {
    try {
        const snapshot = await collectionRef.get();
        const asistentes: AsistenteData[] = [];
        snapshot.forEach(doc => {
            asistentes.push({ id: doc.id, ...doc.data() } as AsistenteData);
        });
        return asistentes;
    } catch (error) {
        console.error('Error al obtener asistentes:', error);
        return [];
    }
}