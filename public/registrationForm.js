import { UsuarioService } from "./usuarioService.js";

function iniciarRegistro() {
  const form = document.getElementById("registroForm");
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  const submitSpinner = document.getElementById("submitSpinner");

  if (!form) {
    console.error("No se encontró el formulario");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitText.classList.add("hidden");
    submitSpinner.classList.remove("hidden");

    const usuario = {
      NOMBRE_Y_APELLIDOS: form.nombreCompleto.value.trim(),
      CEDULA: form.cedula.value.trim(),
      CORREO: form.correo.value.trim(),
      AREA_O_DEPENDENCIA: form.area.value.trim(),
    };

    try {
      await UsuarioService.agregarUsuario(usuario);

      Swal.fire({
        icon: "success",
        title: "¡Usuario registrado!",
        text: `${form.nombreCompleto.value.trim()}`,
      });

      form.reset();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Algo salió mal",
      });
    } finally {
      submitBtn.disabled = false;
      submitText.classList.remove("hidden");
      submitSpinner.classList.add("hidden");
    }
  });
}

iniciarRegistro();
