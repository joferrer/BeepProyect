import { UsuarioService } from "./UsuarioService.js";

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

buscador.disabled = true;
UsuarioService.cargarUsuarios()
  .then(() => {
    buscador.disabled = false;
  })
  .catch((err) => {
    console.error("Error cargando usuarios:", err);
    alert("Error cargando los datos de usuarios.");
  });

// Buscador con flechas
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
      sugerenciasItems[indiceSeleccionado].click();
    } else {
      const primerItem = sugerencias.querySelector("li");
      if (primerItem) primerItem.click();
    }
  }
});

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase().trim();
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
    filtrados.forEach((u) => {
      const li = document.createElement("li");
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
      li.textContent = `${u.NOMBRE_Y_APELLIDOS} - ${u.CEDULA}`;
      li.addEventListener("click", () => {
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
      });

      sugerencias.appendChild(li);
      sugerenciasItems.push(li);
    });
  }

  sugerencias.classList.remove("hidden");
});

function actualizarSeleccionVisual() {
  sugerenciasItems.forEach((item, index) => {
    item.classList.toggle("bg-gray-200", index === indiceSeleccionado);
  });
}

cambiarBtn.addEventListener("click", () => {
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
});

// RFID lectura
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

function procesarRFID(valor) {
  if (procesando || !valor) return;

  const usuario = UsuarioService.obtenerSeleccionado();

  if (!usuario) {
    feedback.textContent = "⚠️ Selecciona primero un usuario.";
    feedback.className =
      "text-yellow-600 font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";
    return;
  }

  procesando = true;
  inputRFID.disabled = true;
  feedback.textContent = "Procesando...";
  feedback.className =
    "text-blue-600 font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";

  setTimeout(() => {
    console.log("Enlazado:", {
      rfid: valor,
      ...usuario,
    });

    feedback.textContent = `✅ RFID ${valor} enlazado con ${usuario.NOMBRE_Y_APELLIDOS}`;
    feedback.className =
      "text-green-600 font-semibold h-8 flex items-center transition-all duration-300 min-h-[2rem]";

    inputRFID.value = "";
    inputRFID.disabled = true;
    inputRFID.placeholder = "Esperando selección...";
    inputRFID.classList.remove("text-gray-800");
    inputRFID.classList.add("text-gray-500");

    buscador.value = "";
    buscador.readOnly = false;

    UsuarioService.limpiarSeleccion();

    nombreInfo.textContent = "-";
    documentoInfo.textContent = "-";
    areaInfo.textContent = "-";
    correoInfo.textContent = "-";

    cambiarBtn.classList.add("hidden");
    procesando = false;

    setTimeout(() => {
      feedback.textContent = "";
      feedback.className =
        "text-lg font-medium h-8 flex items-center transition-all duration-300 min-h-[2rem]";
    }, 1300);

    buscador.focus();
  }, 1500);
}

setInterval(() => {
  if (!document.activeElement || document.activeElement !== inputRFID) {
    if (!inputRFID.disabled) {
      inputRFID.focus();
    }
  }
}, 200);
