const usuarios = [
  {
    NOMBRE_Y_APELLIDOS: "ERWIN DANIEL VILLAMIZAR",
    CEDULA: 1004879410,
    CORREO: "VILLAVESDANIEL1@OUTLOOK.COM",
    AREA_O_DEPENDENCIA: "CONSULTA EXTERNA AUXILIAR DE NEFERMERIA",
  },
  {
    NOMBRE_Y_APELLIDOS: "ANA MARÍA GÓMEZ",
    CEDULA: 987654321,
    AREA_O_DEPENDENCIA: "ADMINISTRACIÓN",
  },
];

const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");
const inputRFID = document.getElementById("rfid");
const feedback = document.getElementById("feedback");
const cambiarBtn = document.getElementById("cambiarBtn");

const nombreInfo = document.getElementById("nombreInfo");
const documentoInfo = document.getElementById("documentoInfo");
const areaInfo = document.getElementById("areaInfo");
const correoInfo = document.getElementById("correoInfo");

let usuarioSeleccionado = null;
let procesando = false;

// Buscador
buscador.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const primerItem = sugerencias.querySelector("li");
    if (primerItem && !sugerencias.classList.contains("hidden")) {
      primerItem.click();
      e.preventDefault();
    }
  }
});

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase().trim();
  sugerencias.innerHTML = "";
  if (texto === "") {
    sugerencias.classList.add("hidden");
    return;
  }

  const filtrados = usuarios.filter(
    (u) =>
      u.NOMBRE_Y_APELLIDOS.toLowerCase().includes(texto) ||
      String(u.CEDULA).includes(texto)
  );

  if (filtrados.length === 0) {
    sugerencias.innerHTML =
      '<li class="px-4 py-2 text-gray-500">No encontrado</li>';
  } else {
    filtrados.forEach((u) => {
      const li = document.createElement("li");
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
      li.textContent = `${u.NOMBRE_Y_APELLIDOS} - ${u.CEDULA}`;
      li.addEventListener("click", () => {
        buscador.value = u.NOMBRE_Y_APELLIDOS;
        buscador.readOnly = true; // 👈 Bloquear el buscador
        sugerencias.classList.add("hidden");

        nombreInfo.textContent = u.NOMBRE_Y_APELLIDOS;
        documentoInfo.textContent = u.CEDULA;
        areaInfo.textContent = u.AREA_O_DEPENDENCIA || "-";
        correoInfo.textContent = u.CORREO?.trim() || "-";

        usuarioSeleccionado = u;

        inputRFID.disabled = false;
        inputRFID.placeholder = "Escaneé la escarapela...";
        inputRFID.classList.remove("text-gray-500");
        inputRFID.classList.add("text-gray-800");
        inputRFID.focus();

        cambiarBtn.classList.remove("hidden");
      });
      sugerencias.appendChild(li);
    });
  }

  sugerencias.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!sugerencias.contains(e.target) && e.target !== buscador) {
    sugerencias.classList.add("hidden");
  }
});

cambiarBtn.addEventListener("click", () => {
  usuarioSeleccionado = null;

  buscador.value = "";
  buscador.readOnly = false; // 👈 Habilitar el buscador
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

  if (!usuarioSeleccionado) {
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
      ...usuarioSeleccionado,
    });

    feedback.textContent = `✅ RFID ${valor} enlazado con ${usuarioSeleccionado.NOMBRE_Y_APELLIDOS}`;
    feedback.className =
      "text-green-600 font-semibold h-8 flex items-center transition-all duration-300 min-h-[2rem]";

    inputRFID.value = "";
    inputRFID.disabled = true;
    inputRFID.placeholder = "Esperando selección...";
    inputRFID.classList.remove("text-gray-800");
    inputRFID.classList.add("text-gray-500");

    buscador.value = "";
    buscador.readOnly = false; // 👈 Habilitar el buscador nuevamente

    usuarioSeleccionado = null;
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

// Enfoque automático en RFID si está activo
setInterval(() => {
  if (!document.activeElement || document.activeElement !== inputRFID) {
    if (!inputRFID.disabled) {
      inputRFID.focus();
    }
  }
}, 200);
