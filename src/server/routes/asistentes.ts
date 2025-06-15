import { obtenerAsistentes, registrarAsistente } from "../../firebase/db";
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
    
    if (!persona || !persona.NOMBRE || !persona.APELLIDO) {
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