export const UsuarioService = (() => {
  let usuarios = [];
  let usuarioSeleccionado = null;

  async function cargarUsuarios(
    source = "http://localhost:3000/api/asistentes"
  ) {
    if (usuarios.length > 0) {
      // Ya cargado, no hace falta volver a hacerlo
      return usuarios;
    }

    try {
      const res = await fetch(source, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("No se pudo cargar la lista de asistentes");

      usuarios = await res.json();
      return usuarios;
    } catch (error) {
      console.error("❌ Error al cargar asistentes:", error);
      throw error;
    }
  }

  function setUsuariosManualmente(lista) {
    usuarios = lista;
  }

  function buscarUsuarios(query = "") {
    const texto = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (!texto) return [];

    const textoNumerico = texto.replace(/[^\d]/g, "");

    return usuarios.filter((u) => {
      const nombre = (u.NOMBRE_Y_APELLIDOS || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      const cedula = String(u.CEDULA || "").replace(/[^\d]/g, "");

      if (textoNumerico && cedula.startsWith(textoNumerico)) return true;
      return nombre.includes(texto);
    });
  }

  async function agregarUsuario(usuario) {
    // Limpiar cédula de caracteres no numéricos
    usuario.CEDULA = String(usuario.CEDULA).replace(/[^\d]/g, "");

    try {
      const res = await fetch("http://localhost:3000/api/asistente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (!res.ok) throw new Error("Error al registrar el usuario");

      const data = await res.json();
      console.log("🟢 Usuario registrado correctamente:", data);

      // Agregar a la lista local si es necesario
      usuarios.push(data);

      return data;
    } catch (error) {
      console.error("❌ Error al agregar usuario:", error);
      throw error;
    }
  }

  function seleccionarUsuario(usuario) {
    usuarioSeleccionado = usuario;
  }

  function obtenerSeleccionado() {
    return usuarioSeleccionado;
  }

  function limpiarSeleccion() {
    usuarioSeleccionado = null;
  }

  async function registrarAsistencia(usuario, rfid) {
    const asistencia = {
      usuario,
      rfid,
      fecha: new Date().toISOString(),
    };
    console.log("🟢 Registro de asistencia:", asistencia);
  }

  async function enlazarRFID(usuario, rfid) {
    const enlace = {
      cedula: usuario.CEDULA,
      rfid,
    };
    console.log("🔗 Enlace RFID:", enlace);
  }

  return {
    cargarUsuarios,
    setUsuariosManualmente,
    buscarUsuarios,
    agregarUsuario,
    seleccionarUsuario,
    obtenerSeleccionado,
    limpiarSeleccion,
    registrarAsistencia,
    enlazarRFID,
  };
})();
