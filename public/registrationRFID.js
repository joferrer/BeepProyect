import { UsuarioService } from "./usuarioService.js";

document.addEventListener("DOMContentLoaded", () => {
  history.pushState(null, null, location.href);
  window.addEventListener("popstate", function () {
    history.pushState(null, null, location.href);
  });

  const mesa = localStorage.getItem("mesaSeleccionada");
  const mesaSpan = document.getElementById("mesaSeleccionada");
  mesaSpan.textContent = mesa || "No seleccionada";

  const input = document.getElementById("documentoInput");
  const feedback = document.getElementById("feedback");

  let procesando = false;

  // Mantener el foco siempre en el input
  setInterval(() => {
    if (!document.activeElement || document.activeElement !== input) {
      input.focus();
    }
  }, 200);

  let lastTime = Date.now();
  let buffer = "";

  input.addEventListener("keydown", (e) => {
    const now = Date.now();
    const diff = now - lastTime;

    if (diff > 50) buffer = "";

    lastTime = now;

    if (e.key.match(/[0-9]/)) {
      buffer += e.key;
      e.preventDefault();
    } else if (e.key === "Enter") {
      input.value = buffer;
      procesarRFID(buffer);
      buffer = "";
      e.preventDefault();
    } else {
      e.preventDefault();
    }
  });

  async function procesarRFID(rfid) {
    if (procesando || !rfid) return;

    procesando = true;
    input.disabled = true;
    feedback.textContent = "Procesando...";
    feedback.className =
      "text-yellow-600 font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";

    try {
      const resultado = await UsuarioService.registrarAsistencia(mesa, rfid);

      feedback.textContent = `✅ ${
        resultado.mensaje || "Asistencia registrada correctamente"
      }`;
      feedback.className =
        "text-green-600 font-semibold h-8 flex items-center transition-all duration-300 min-h-[2rem]";
    } catch (error) {
      feedback.textContent = `❌ ${
        error.message || "Error al registrar asistencia"
      }`;
      feedback.className =
        "text-red-600 font-semibold h-8 flex items-center transition-all duration-300 min-h-[2rem]";
    } finally {
      input.disabled = false;
      input.value = "";
      input.focus();
      procesando = false;

      setTimeout(() => {
        feedback.textContent = "";
        feedback.className =
          "text-lg font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";
      }, 1300);
    }
  }
});
