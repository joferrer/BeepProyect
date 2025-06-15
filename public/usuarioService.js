// UsuarioService.js
export const UsuarioService = (() => {
  let usuarios = [];
  let usuarioSeleccionado = null;

  async function cargarUsuarios(source = "/store/preregistro.json") {
    try {
      const res = await fetch(source);
      if (!res.ok) throw new Error("No se pudo cargar el archivo JSON");
      usuarios = await res.json();
      return usuarios;
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      throw error;
    }
  }

  function setUsuariosManualmente(lista) {
    usuarios = lista;
  }

  function buscarUsuarios(query = "") {
    const texto = query.toLowerCase().trim();
    if (!texto) return [];
    return usuarios.filter(
      (u) =>
        u.NOMBRE_Y_APELLIDOS?.toLowerCase().includes(texto) ||
        String(u.CEDULA).includes(texto)
    );
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

  return {
    cargarUsuarios,
    setUsuariosManualmente,
    buscarUsuarios,
    seleccionarUsuario,
    obtenerSeleccionado,
    limpiarSeleccion,
  };
})();
