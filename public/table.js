// mesa.js

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("mesaSelect");
  for (let i = 1; i <= 14; i++) {
    const option = document.createElement("option");
    option.value = `Mesa ${i}`;
    option.textContent = `Mesa ${i}`;
    select.appendChild(option);
  }
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
