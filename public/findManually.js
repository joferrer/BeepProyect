import { UsuarioService } from "./UsuarioService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const scanBtn = document.getElementById("scan");
  const modal = document.getElementById("modalBuscador");
  const cerrarModal = document.getElementById("cerrarModal");
  const cancelarModal = document.getElementById("cancelarModal");
  const aceptarModal = document.getElementById("aceptarModal");
  const documentoInput = document.getElementById("documentoInput");
  const buscador = document.getElementById("buscador");
  const sugerencias = document.getElementById("sugerencias");
  const feedbackModal = document.getElementById("feedbackModal");

  let sugerenciasItems = [];
  let indiceSeleccionado = -1;

  buscador.disabled = true;
  try {
    await UsuarioService.cargarUsuarios();
    buscador.disabled = false;
  } catch (err) {
    console.error("Error cargando usuarios:", err);
    alert("Error cargando los datos de usuarios.");
    return;
  }

  scanBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    documentoInput.disabled = true;
    buscador.value = "";
    buscador.readOnly = false;
    buscador.focus();
    UsuarioService.limpiarSeleccion();
    feedbackModal.textContent = "";
    sugerencias.innerHTML = "";
  });

  function cerrarYResetearModal(mensaje = "") {
    modal.classList.add("hidden");
    documentoInput.disabled = false;
    documentoInput.focus();
    feedbackModal.textContent = mensaje;
    UsuarioService.limpiarSeleccion();
    indiceSeleccionado = -1;
  }

  cerrarModal.addEventListener("click", () =>
    cerrarYResetearModal("❌ Cancelado")
  );
  cancelarModal.addEventListener("click", () =>
    cerrarYResetearModal("❌ Cancelado")
  );

  aceptarModal.addEventListener("click", () => {
    const seleccionado = UsuarioService.obtenerSeleccionado();
    if (!seleccionado) {
      feedbackModal.textContent = "⚠️ Selecciona un invitado";
      return;
    }
    registrarManual(seleccionado);
    cerrarYResetearModal("✅ Registrado");
  });

  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();
    sugerencias.innerHTML = "";
    UsuarioService.limpiarSeleccion();
    sugerenciasItems = [];
    indiceSeleccionado = -1;
    feedbackModal.textContent = "";

    if (texto === "") {
      sugerencias.classList.add("hidden");
      return;
    }

    const filtrados = UsuarioService.buscarUsuarios(texto);

    if (filtrados.length === 0) {
      sugerencias.innerHTML =
        '<li class="px-4 py-2 text-gray-500">No encontrado</li>';
    } else {
      filtrados.forEach((u) => {
        const li = document.createElement("li");
        li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
        li.textContent = `${u.NOMBRE_Y_APELLIDOS} - ${u.CEDULA}`;
        li.addEventListener("click", () => {
          seleccionarUsuario(u, li);
        });
        sugerencias.appendChild(li);
        sugerenciasItems.push({ element: li, data: u });
      });
    }

    sugerencias.classList.remove("hidden");
  });

  function seleccionarUsuario(usuario, liElement) {
    buscador.value = `${usuario.NOMBRE_Y_APELLIDOS} - ${usuario.CEDULA}`;
    buscador.readOnly = true;
    UsuarioService.seleccionarUsuario(usuario);
    sugerencias.classList.add("hidden");
    feedbackModal.textContent = "";
    sugerenciasItems.forEach((item) =>
      item.element.classList.remove("bg-gray-200")
    );
    if (liElement) {
      liElement.classList.add("bg-gray-200");
    }
  }

  buscador.addEventListener("keydown", (e) => {
    if (sugerencias.classList.contains("hidden")) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (indiceSeleccionado < sugerenciasItems.length - 1) {
        indiceSeleccionado++;
        actualizarSeleccionVisual();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (indiceSeleccionado > 0) {
        indiceSeleccionado--;
        actualizarSeleccionVisual();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (indiceSeleccionado >= 0) {
        const item = sugerenciasItems[indiceSeleccionado];
        seleccionarUsuario(item.data, item.element);
      } else if (sugerenciasItems.length > 0) {
        const item = sugerenciasItems[0];
        seleccionarUsuario(item.data, item.element);
      }
    }
  });

  function actualizarSeleccionVisual() {
    sugerenciasItems.forEach((item, index) => {
      item.element.classList.toggle(
        "bg-gray-200",
        index === indiceSeleccionado
      );
    });
  }

  document.addEventListener("click", (e) => {
    if (!sugerencias.contains(e.target) && e.target !== buscador) {
      sugerencias.classList.add("hidden");
    }
  });

  function registrarManual(usuario) {
    console.log("📝 Invitado seleccionado manualmente:", usuario);
    localStorage.setItem("invitadoSeleccionadoManual", JSON.stringify(usuario));
    feedbackModal.textContent = `✅ Invitado listo para registrar: ${usuario.NOMBRE_Y_APELLIDOS}`;
  }
});
