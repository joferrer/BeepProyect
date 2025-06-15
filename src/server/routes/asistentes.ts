import { obtenerAsistentes } from "../../firebase/db";
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