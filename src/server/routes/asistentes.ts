import { asignarRFID, obtenerAsistentePorNombreOCedula, obtenerAsistentes, registrarAsistencia, registrarAsistenciaPorNombre, registrarAsistenciaPorRFID, registrarAsistente } from "../../firebase/db";
import  { Router } from "express";
import { guardarAsistenciaLocal, obtenerAsistenciasLocales, registrarErroresEnElCargadoDeAsistencias } from "./files";
import { AsistenciaLocal } from "../../interfaces";

export const asistentesRouter = Router();

asistentesRouter.get("/asistentes", async (_req, res) => {
    try {
        const asistentes = await obtenerAsistentes();
        res.status(200).json(asistentes);
    } catch (error) {
        console.error("Error al obtener asistentes:", error);
        res.status(500).json({ error: "Error al obtener asistentes" });
    }
});

asistentesRouter.post("/asistente", async (req, res) => {
    const persona = req.body;

    if (!persona) {
        res.status(400).json({ error: "Datos incompletos" });
        return;
    }

    try {
        const registrado = await registrarAsistente(persona);
        if (!registrado) {
            res.status(500).json({ error: "Error al registrar asistente" });
            return;
        }
        res.status(201).json({ message: "Asistente registrado exitosamente", id: registrado.id });
        
    } catch (error) {
        console.error("Error al registrar asistente:", error);
        res.status(500).json({ error: "Error al registrar asistente" });
    }
})

asistentesRouter.patch("/asignacionRfid/:id", async (req, res) => {
    const { id } = req.params;
    const { rfid } = req.body;

    if (!rfid) {
        res.status(400).json({ error: "RFID es requerido" });
        return;
    }

    try {
        const asignado = await asignarRFID(id, rfid);
        if (asignado) {
            res.status(200).json({ message: "RFID asignado exitosamente" });
        } else {
            res.status(500).json({ error: "Error al asignar RFID" });
        }
    } catch (error) {
        console.error("Error al asignar RFID:", error);
        res.status(500).json({ error: "Error al asignar RFID" });
    }
})

asistentesRouter.get("/asistentePorNombreOCedula/:dato", async (req, res) => {
    const { dato } = req.params;

    if (!dato) {
        res.status(400).json({ error: "Dato es requerido" });
        return;
    }

    try {

        let cedulaQuery: string | number = dato;
        if (!isNaN(Number(dato))) {
            cedulaQuery = Number(dato);
        }
        const asistente = await obtenerAsistentePorNombreOCedula({ nombre: dato, cedula: cedulaQuery });

        if (asistente) {
            res.status(200).json(asistente);
        } else {
            res.status(404).json({ error: `Asistente ${dato} no encontrado` });
        }
    } catch (error) {
        console.error("Error al buscar asistente:", error);
        res.status(500).json({ error: "Error al buscar asistente" });
    }
})

asistentesRouter.patch("/registrarAsistencia/:id", async (req, res) => {
    const { id } = req.params;
    const {  mesa } = req.body;

    if ( !mesa) {
        res.status(400).json({ error: "Mesa es requerida" });
        return;
    }

    try {
        const asistencia = { fecha: new Date(), mesa };
        const registrado = await registrarAsistencia(id, asistencia);
        if (registrado) {
            res.status(200).json({ message: "Asistencia registrada exitosamente" });
        } else {
            res.status(500).json({ error: "Error al registrar asistencia" });
        }
    } catch (error) {
        console.error("Error al registrar asistencia:", error);
        res.status(500).json({ error: "Error al registrar asistencia" });
    }
})

asistentesRouter.post("/registrarAsistenciaLocal", async (req, res) => {
    const { rfid,mesa,nombre } = req.body;

    if (!rfid && !nombre) {
        res.status(400).json({ error: "RFID o el nombre es requerido" });
        return;
    }

    try {
        const resultado = await guardarAsistenciaLocal(rfid,mesa,nombre); // Reemplazar con la llamada real

        if (resultado) {
            res.status(200).json({ message: "Asistencia guardada localmente" });
        } else {
            res.status(500).json({ error: "Error al guardar asistencia localmente" });
        }
    } catch (error) {
        console.error("Error al guardar asistencia local:", error);
        res.status(500).json({ error: "Error al guardar asistencia local" });
    }
}) 

asistentesRouter.get("/asistenciasLocales", async (_req, res) => {
    try {
        const asistenciasLocales = await obtenerAsistenciasLocales();
        res.status(200).json(asistenciasLocales);
    } catch (error) {
        console.error("Error al obtener asistencias locales:", error);
        res.status(500).json({ error: "Error al obtener asistencias locales" });
    }
})

asistentesRouter.patch("/registrarAsistenciasLocalesEnDb", async (_req, res) => {
    try {
        const asistenciasLocales = await obtenerAsistenciasLocales();
        if (asistenciasLocales.length === 0) {
            res.status(404).json({ message: "No hay asistencias locales registradas" });
            return;
        }
        let registrosExitosos = 0;
        let registrosFallidos = 0;
        let errores: AsistenciaLocal[] = [];

        for (const asistencia of asistenciasLocales) {
            let registroExitoso = false;
            const { rfid, mesa, fecha, nombre } = asistencia;
            // Aquí deberías implementar la lógica para registrar cada asistencia en la base de datos
            // Por ejemplo, podrías llamar a una función que registre la asistencia en Firebase
            // await registrarAsistenciaEnDb(rfid, mesa, fecha);
            if(rfid){
                registroExitoso = await registrarAsistenciaPorRFID(rfid, { fecha: new Date(fecha), mesa });
                
            }
            else if(nombre){
                registroExitoso = await registrarAsistenciaPorNombre(nombre, { fecha: new Date(fecha), mesa });
            }
            else {
                console.error("Asistencia sin RFID ni nombre:", asistencia);
                registrosFallidos++;
                continue;
            }
            
            if (registroExitoso) {
                registrosExitosos++;
            } else {
                registrosFallidos++;
                errores.push(asistencia);

            }
            
        }
        if (errores.length > 0) {
            console.error("Errores al registrar asistencias locales:");
            // Aquí podrías guardar los errores en un archivo o en la base de datos
            // await registrarErroresEnElCargadoDeAsistencias(errores);
            await registrarErroresEnElCargadoDeAsistencias(errores);

        }

        res.status(200).json({ message: `Registro de asistencias locales completado. Registros exitosos: ${registrosExitosos}, Registros fallidos: ${registrosFallidos}`, errores });
    } catch (error) {
        console.error("Error al registrar asistencias locales en la base de datos:", error);
        res.status(500).json({ error: "Error al registrar asistencias locales en la base de datos" });
    }
})