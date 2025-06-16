import { UsuarioService } from "./usuarioService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const scanBtn = document.getElementById("scan");
  const modal = document.getElementById("modalBuscador");
  const cerrarModal = document.getElementById("cerrarModal");
  const cancelarModal = document.getElementById("cancelarModal");
  const aceptarModal = document.getElementById("aceptarModal");
  const documentoInput = document.getElementById("documentoInput");
  const buscador = document.getElementById("buscador");

  scanBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    documentoInput.disabled = true; // 🔒 Deshabilita el RFID
    buscador.value = "";
    buscador.focus();
  });

  function cerrarYResetearModal() {
    modal.classList.add("hidden");
    documentoInput.disabled = false; // 🔓 Habilita el RFID
    documentoInput.focus();
  }

  cerrarModal.addEventListener("click", () => {
    cerrarYResetearModal();
    Swal.fire({
      icon: "info",
      title: "Cancelado",
      text: "No se registró ninguna asistencia",
      timer: 1500,
      showConfirmButton: false,
    });
  });

  cancelarModal.addEventListener("click", () => {
    cerrarYResetearModal();
    Swal.fire({
      icon: "info",
      title: "Cancelado",
      text: "No se registró ninguna asistencia",
      timer: 1500,
      showConfirmButton: false,
    });
  });

  aceptarModal.addEventListener("click", async () => {
    const texto = buscador.value.trim();

    if (!texto) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "⚠️ Ingresa un número de documento",
      });
      return;
    }

    await registrarManual(texto);
  });

  async function registrarManual(cedula) {
    console.log("📝 Invitado seleccionado manualmente:", cedula);
    let mesa = localStorage.getItem("mesaSeleccionada");

    try {
      const respuesta = await UsuarioService.registrarAsistenciaManual(
        mesa,
        cedula
      );
      console.log("✅ Respuesta del servidor:", respuesta);

      cerrarYResetearModal();

      Swal.fire({
        icon: "success",
        title: "Asistencia registrada",
        text: "Se ha registrado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("❌ Error al registrar asistencia:", error);
      cerrarYResetearModal();

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la asistencia. Intenta nuevamente.",
      });
    }
  }
});
