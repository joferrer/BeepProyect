import { asignarRFID, obtenerAsistentePorNombreOCedula, obtenerAsistentes, registrarAsistente } from "../../firebase/db";
import { Router } from "express";

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
    
    if (!persona ) {
         res.status(400).json({ error: "Datos incompletos" });
         return;
    }
    
    try {
        const registrado = await registrarAsistente(persona);
        if (registrado) {
        res.status(201).json({ message: "Asistente registrado exitosamente" });
        } else {
        res.status(500).json({ error: "Error al registrar asistente" });
        }
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