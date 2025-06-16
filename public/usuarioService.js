export const UsuarioService = (() => {
  let usuarios = [];
  let usuarioSeleccionado = null;
  let isLoading = false;

  async function cargarUsuarios() {
    if (usuarios.length > 0) {
      console.log("⚡ Usuarios cargados desde memoria");
      return usuarios;
    }

    isLoading = true;
    try {
      const res = await fetch("/store/preregistro.json");
      if (!res.ok) throw new Error("No se pudo cargar el archivo JSON");

      usuarios = await res.json();
      console.log(`📄 ${usuarios.length} usuarios cargados del archivo local`);
      return usuarios;
    } catch (error) {
      console.error("❌ Error al cargar usuarios del JSON:", error);
      throw error;
    } finally {
      isLoading = false;
    }
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

      return (
        (textoNumerico && cedula.startsWith(textoNumerico)) ||
        nombre.includes(texto)
      );
    });
  }

  function buscarPorCedula(cedula) {
    return usuarios.find((u) => String(u.CEDULA) === String(cedula));
  }

  async function agregarUsuario(usuario) {
    usuario.CEDULA = usuario.CEDULA
      ? String(usuario.CEDULA).replace(/[^\d]/g, "")
      : null;

    const nombreLimpio = (usuario.NOMBRE_Y_APELLIDOS || "")
      .toLowerCase()
      .trim();

    const existe = usuarios.some((u) => {
      const mismaCedula = usuario.CEDULA && String(u.CEDULA) === usuario.CEDULA;
      const mismoNombre =
        (u.NOMBRE_Y_APELLIDOS || "").toLowerCase().trim() === nombreLimpio;
      return mismaCedula || mismoNombre;
    });

    if (existe) {
      const infoExtra = usuario.CEDULA
        ? `la cédula ${usuario.CEDULA}`
        : `el nombre ${usuario.NOMBRE_Y_APELLIDOS}`;
      const errorMsg = `⚠️ Ya existe un usuario con ${infoExtra}`;
      console.warn(errorMsg);
      throw new Error(errorMsg);
    }

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
      usuario.id = data.id || data._id || data.uid;

      usuarios.push(usuario);
      console.log("✅ Usuario agregado y sincronizado con el JSON local");
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

  async function registrarAsistencia(mesa = null, rfid) {
    try {
      const res = await fetch("/api/registrarAsistenciaLocal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfid, mesa }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en la solicitud");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error al registrar asistencia:", error);
      throw error;
    }
  }

  async function registrarAsistenciaManual(mesa = null, cedula) {
    try {
      const res = await fetch("/api/registrarAsistenciaLocal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cedula, mesa }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en la solicitud");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error al registrar asistencia manual:", error);
      throw error;
    }
  }

  async function enlazarRFID(usuario, rfid) {
    if (!usuario || !usuario.id) {
      console.warn("❌ Usuario inválido o sin ID para enlazar RFID.");
      throw new Error("Usuario inválido o sin ID.");
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/asignacionRfid/${usuario.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rfid }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al enlazar RFID");
      }

      const data = await res.json();
      console.log("✅ RFID enlazado correctamente:", data);
      return data;
    } catch (error) {
      console.error("❌ Error al enlazar RFID:", error);
      throw error;
    }
  }

  return {
    cargarUsuarios,
    buscarUsuarios,
    agregarUsuario,
    seleccionarUsuario,
    obtenerSeleccionado,
    limpiarSeleccion,
    registrarAsistencia,
    registrarAsistenciaManual,
    enlazarRFID,
    buscarPorCedula,
  };
})();
