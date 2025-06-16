// mesa.js

document.addEventListener("DOMContentLoaded", () => {
  const mesas = [
    "Ruleta de la Calidad",
    "Dale la vuelta a la Calidad",
    "Vibra con el Tejo",
    "Fútbol en Tela",
    "Zona de Bienvenida",
    "Estrategia IAMII",
    "EAE Mejoramiento de la calidad: Eje Humanización de la atención",
    "EAE Gerencia de la información y gestión de la tecnología: Eje Gestión de la tecnología",
    "EAE Gerencia de Ambiente Físico: Eje Responsabilidad Social",
    "EAE Gerencia de Talento Humano: Eje Transformación Cultural",
    "EAE Direccionamiento y Gerencia: Eje Enfoque y Gestión del Riesgo",
    "EAE Proceso de Atención al Cliente Asistencial: Eje Gestión Clínica Excelente y Segura",
  ];

  const select = document.getElementById("mesaSelect");
  mesas.forEach((nombreMesa) => {
    const option = document.createElement("option");
    option.value = nombreMesa;
    option.textContent = nombreMesa;
    select.appendChild(option);
  });
});

function continuar() {
  const mesa = document.getElementById("mesaSelect").value;
  if (!mesa) {
    alert("Por favor selecciona una mesa.");
    return;
  }
  localStorage.setItem("mesaSeleccionada", mesa);
  window.location.href = "registrationRFID.html";
}

function iniciarSidebar() {
  const buttons = document.querySelectorAll(".sidebar-btn");
  buttons.forEach((btn) => {
    btn.classList.add(
      "w-20",
      "h-20",
      "bg-gray-200",
      "rounded-2xl",
      "shadow",
      "border",
      "border-gray-400",
      "flex",
      "items-center",
      "justify-center",
      "text-4xl",
      "hover:bg-gray-300",
      "transition",
      "duration-200"
    );
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("bg-blue-500", "text-white"));
      btn.classList.add("bg-blue-500", "text-white");
    });
  });
}
