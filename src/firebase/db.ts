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

export const asignarRFID = async (id: string, rfid: string) => {
    try {
        const docRef = collectionRef.doc(id);
        await docRef.update({ RFID: rfid });
        console.log(`RFID ${rfid} asignado al asistente con ID ${id}`);
        return true;
    } catch (error) {
        console.error('Error al asignar RFID:', error);
        return false;
    }
}

export const obtenerAsistentePorNombreOCedula = async ({nombre,cedula}:{nombre: string, cedula: string|number}): Promise<AsistenteData | null> => {
    try {
        const snapshot = await collectionRef.where('NOMBRE_Y_APELLIDOS', '==', nombre).get()
        
        if(!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AsistenteData;
        
        const snapshotCedula = await collectionRef.where('CEDULA', '==', cedula).get();
        
        if (!snapshotCedula.empty) {
            return { id: snapshotCedula.docs[0].id, ...snapshotCedula.docs[0].data() } as AsistenteData;
        }

        console.log('No se encontró ningún asistente con ese nombre');
        return null;
        
    } catch (error) {
        console.error('Error al buscar asistente:', error);
        return null;
    }
}

export const registrarAsistencia = async (id: string, asistencia: { fecha: Date, mesa: string }) => {
    try {
        const docRef = collectionRef.doc(id);
        const asistenteData = await docRef.get();

        if (!asistenteData.exists) {
            console.error('Asistente no encontrado');
            return false;
        }

        const asistente = asistenteData.data() as AsistenteData;
        const asistenciaActual = asistente.ASISTENCIA || [];

        asistenciaActual.push(asistencia);
        
        await docRef.update({ ASISTENCIA: asistenciaActual });
        console.log(`Asistencia registrada para el asistente con ID ${id}`);
        return true;
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        return false;
    }
}

export const registrarAsistenciaPorRFID = async (rfid: string, asistencia: { fecha: Date, mesa: string }) => {
    try {
        const snapshot = await collectionRef.where('RFID', '==', rfid).get();

        if (snapshot.empty) {
            console.error('Asistente con RFID no encontrado');
            return false;
        }

        const asistenteId = snapshot.docs[0].id;
        return await registrarAsistencia(asistenteId, asistencia);
    } catch (error) {
        console.error('Error al registrar asistencia por RFID:', error);
        return false;
    }
}

export const registrarAsistenciaPorNombre = async (nombre: string, asistencia: { fecha: Date, mesa: string }) => {
    try {
        const snapshot = await collectionRef.where('NOMBRE_Y_APELLIDOS', '==', nombre).get();

        if (snapshot.empty) {
            console.error('Asistente con nombre no encontrado');
            return false;
        }

        const asistenteId = snapshot.docs[0].id;
        return await registrarAsistencia(asistenteId, asistencia);
    } catch (error) {
        console.error('Error al registrar asistencia por nombre:', error);
        return false;
    }
}