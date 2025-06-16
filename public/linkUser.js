import { UsuarioService } from "./usuarioService.js";

const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");
const inputRFID = document.getElementById("rfid");
const feedback = document.getElementById("feedback");
const cambiarBtn = document.getElementById("cambiarBtn");

const nombreInfo = document.getElementById("nombreInfo");
const documentoInfo = document.getElementById("documentoInfo");
const areaInfo = document.getElementById("areaInfo");
const correoInfo = document.getElementById("correoInfo");

let procesando = false;
let sugerenciasItems = [];
let indiceSeleccionado = -1;

const loader = document.getElementById("loader");

buscador.disabled = true;
loader.style.display = "flex";

UsuarioService.cargarUsuarios()
  .then(() => {
    buscador.disabled = false;
  })
  .catch((err) => {
    console.error("Error cargando usuarios:", err);
    console.log("cargados:", UsuarioService.estadisticasCache());
    Swal.fire({
      icon: "error",
      title: "Error al cargar usuarios",
      text: "No se pudo cargar la lista de asistentes.",
      footer: "<small>Contacta con Soporte Técnico.</small>",
      confirmButtonColor: "#d33",
    });
  })
  .finally(() => {
    loader.style.display = "none";
  });

// Navegación con teclas
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
      sugerenciasItems[indiceSeleccionado].element.click();
    } else if (sugerenciasItems.length > 0) {
      sugerenciasItems[0].element.click();
    }
  }
});

// Entrada en el buscador
buscador.addEventListener("input", () => {
  const texto = buscador.value.trim();
  sugerencias.innerHTML = "";
  sugerenciasItems = [];
  indiceSeleccionado = -1;

  if (texto === "") {
    sugerencias.classList.add("hidden");
    return;
  }

  const filtrados = UsuarioService.buscarUsuarios(texto);

  if (filtrados.length === 0) {
    sugerencias.innerHTML =
      '<li class="px-4 py-2 text-gray-500">No encontrado</li>';
  } else {
    const regex = new RegExp(`(${texto})`, "gi");

    filtrados.forEach((u) => {
      const li = document.createElement("li");
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";

      // Resaltar coincidencia en nombre
      const nombreResaltado = (u.NOMBRE_Y_APELLIDOS || "").replace(
        regex,
        '<span class="text-blue-600 font-semibold">$1</span>'
      );

      // Resaltar coincidencia en cédula
      const cedulaStr = String(u.CEDULA);
      const cedulaResaltada = cedulaStr.replace(
        regex,
        '<span class="text-blue-600 font-semibold">$1</span>'
      );

      li.innerHTML = `${nombreResaltado} - <span class="text-gray-500">${cedulaResaltada}</span>`;

      li.addEventListener("click", () => {
        seleccionarUsuario(u, li);
      });
      sugerencias.appendChild(li);
      sugerenciasItems.push({ element: li, data: u });
    });
  }

  sugerencias.classList.remove("hidden");
});

function seleccionarUsuario(u) {
  buscador.value = `${u.NOMBRE_Y_APELLIDOS} - ${u.CEDULA}`;
  buscador.readOnly = true;
  sugerencias.classList.add("hidden");

  nombreInfo.textContent = u.NOMBRE_Y_APELLIDOS;
  documentoInfo.textContent = u.CEDULA;
  areaInfo.textContent = u.AREA_O_DEPENDENCIA || "-";
  correoInfo.textContent = u.CORREO?.trim() || "-";

  UsuarioService.seleccionarUsuario(u);

  inputRFID.disabled = false;
  inputRFID.placeholder = "Escanee la escarapela...";
  inputRFID.classList.remove("text-gray-500");
  inputRFID.classList.add("text-gray-800");
  inputRFID.focus();

  cambiarBtn.classList.remove("hidden");
}

function actualizarSeleccionVisual() {
  sugerenciasItems.forEach((item, index) => {
    const el = item.element;
    const seleccionado = index === indiceSeleccionado;

    el.classList.toggle("bg-gray-200", seleccionado);

    if (seleccionado) {
      // Asegura que esté visible en el contenedor
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}

cambiarBtn.addEventListener("click", limpiarFormulario);

function limpiarFormulario() {
  UsuarioService.limpiarSeleccion();

  buscador.value = "";
  buscador.readOnly = false;
  inputRFID.value = "";
  inputRFID.disabled = true;
  inputRFID.placeholder = "Esperando selección...";
  inputRFID.classList.remove("text-gray-800");
  inputRFID.classList.add("text-gray-500");

  nombreInfo.textContent = "-";
  documentoInfo.textContent = "-";
  areaInfo.textContent = "-";
  correoInfo.textContent = "-";

  cambiarBtn.classList.add("hidden");
  feedback.textContent = "";

  buscador.focus();
}

// RFID listener
let rfidBuffer = "";
let lastRFIDTime = Date.now();

inputRFID.addEventListener("keydown", (e) => {
  const now = Date.now();
  const diff = now - lastRFIDTime;

  if (diff > 50) rfidBuffer = "";
  lastRFIDTime = now;

  if (e.key.match(/[0-9]/)) {
    rfidBuffer += e.key;
    e.preventDefault();
  } else if (e.key === "Enter") {
    inputRFID.value = rfidBuffer;
    procesarRFID(rfidBuffer);
    rfidBuffer = "";
    e.preventDefault();
  } else {
    e.preventDefault();
  }
});

async function procesarRFID(valor) {
  if (procesando || !valor) return;

  const usuario = UsuarioService.obtenerSeleccionado();

  if (!usuario) {
    mostrarFeedback("⚠️ Selecciona primero un usuario.", "text-yellow-600");
    return;
  }

  procesando = true;
  inputRFID.disabled = true;
  mostrarFeedback("⏳ Enlazando RFID...", "text-blue-600");

  try {
    const resultado = await UsuarioService.enlazarRFID(usuario, valor);

    mostrarFeedback(
      `✅ RFID ${valor} enlazado con ${usuario.NOMBRE_Y_APELLIDOS}`,
      "text-green-600"
    );

    // Limpiar luego de un corto tiempo
    setTimeout(() => {
      limpiarFormulario();
      feedback.textContent = "";
      feedback.className =
        "text-lg font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";
    }, 1300);
  } catch (error) {
    mostrarFeedback(
      `❌ Error al enlazar RFID: ${error.message}`,
      "text-red-600"
    );
    inputRFID.disabled = false;
    inputRFID.focus();
  } finally {
    procesando = false;
  }
}

function mostrarFeedback(texto, clase) {
  feedback.textContent = texto;
  feedback.className = `${clase} font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]`;
}

// Forzar focus en input RFID
setInterval(() => {
  if (!document.activeElement || document.activeElement !== inputRFID) {
    if (!inputRFID.disabled) inputRFID.focus();
  }
}, 200);

// Cerrar sugerencias si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!sugerencias.contains(e.target) && e.target !== buscador) {
    sugerencias.classList.add("hidden");
  }
});
