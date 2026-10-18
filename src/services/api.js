
const API_BASE_URL = "https://inventario-p078.onrender.com/api";

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Obtener token de autenticación
  const token = localStorage.getItem("authToken");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// =====================================================
// AUTENTICACIÓN
// LOGIN SIN GOOGLE AUTHENTICATOR (2FA)
// =====================================================

export const login = async (correo, contraseña) => {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: correo,
      password: contraseña,
    }),
  });
};

// =====================================================
// 2FA DESACTIVADO TEMPORALMENTE
// Conservamos las funciones originales comentadas.
// =====================================================

/*
// Generar código QR de Google Authenticator
export const generate2FA = async () => {
  return fetchAPI("/auth/2fa/generate");
};

// Guardar configuración 2FA
export const save2FA = async (userId, secret) => {
  return fetchAPI("/auth/2fa/save", {
    method: "POST",
    body: JSON.stringify({ userId, secret }),
  });
};
*/

// =====================================================
// DASHBOARD
// =====================================================

export const getDashboard = async () => {
  return fetchAPI("/dashboard");
};

// =====================================================
// PRODUCTOS
// =====================================================

export const getProductos = async () => {
  try {
    return await fetchAPI("/productos");
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    throw error;
  }
};

export const createProducto = async (producto) => {
  return fetchAPI("/productos", {
    method: "POST",
    body: JSON.stringify(producto),
  });
};

export const updateProducto = async (id, producto) => {
  return fetchAPI(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(producto),
  });
};

export const deleteProducto = async (id) => {
  return fetchAPI(`/productos/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// CATEGORÍAS
// =====================================================

export const getCategorias = async () => {
  return fetchAPI("/categorias");
};

export const createCategoria = async (categoria) => {
  return fetchAPI("/categorias", {
    method: "POST",
    body: JSON.stringify(categoria),
  });
};

export const updateCategoria = async (id, categoria) => {
  return fetchAPI(`/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoria),
  });
};

export const deleteCategoria = async (id) => {
  return fetchAPI(`/categorias/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// CLIENTES
// =====================================================

export const getClientes = async () => {
  return fetchAPI("/clientes");
};

export const createCliente = async (cliente) => {
  return fetchAPI("/clientes", {
    method: "POST",
    body: JSON.stringify(cliente),
  });
};

export const updateCliente = async (id, cliente) => {
  return fetchAPI(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(cliente),
  });
};

export const deleteCliente = async (id) => {
  return fetchAPI(`/clientes/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// INVENTARIO
// =====================================================

export const getInventario = async () => {
  return fetchAPI("/inventario");
};

export const createMovimiento = async (movimiento) => {
  return fetchAPI("/inventario", {
    method: "POST",
    body: JSON.stringify(movimiento),
  });
};

// =====================================================
// VENTAS
// =====================================================

export const getVentas = async () => {
  return fetchAPI("/ventas");
};

export const createVenta = async (venta) => {
  return fetchAPI("/ventas", {
    method: "POST",
    body: JSON.stringify(venta),
  });
};

// =====================================================
// REPORTES
// =====================================================

export const getReporteInventario = async () => {
  return fetchAPI("/reportes/inventario");
};

export const getReporteVentas = async () => {
  return fetchAPI("/reportes/ventas");
};

export const getReporteMovimientos = async () => {
  return fetchAPI("/reportes/movimientos");
};
