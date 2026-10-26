class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  sumarIva() {
    return this.precio * 1.21;
  }

  vender(cantidad) {
    if (cantidad > 0 && cantidad <= this.stock) {
      this.stock -= cantidad;
      return true;
    }
    return false;
  }
}

const productosIniciales = [
  new Producto(1, "Teclado mecánico", 45000, 10),
  new Producto(2, "Mouse gamer", 25000, 15),
  new Producto(3, "Auriculares", 38000, 5),
];

const CUPON_VALIDO = "BIENVENIDO10";
const DESCUENTO_CUPON = 10;

let catalogo = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) ?? [];
let proximoId = Number(localStorage.getItem("proximoId") ?? 4);
let descuento = Number(localStorage.getItem("descuento") ?? 0);

const inputNombre = document.getElementById("nombre");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");
const inputCupon = document.getElementById("cupon");
const btnAgregar = document.getElementById("btn-agregar");
const btnCupon = document.getElementById("btn-cupon");
const btnVaciar = document.getElementById("btn-vaciar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnRecargar = document.getElementById("btn-recargar");
const buscador = document.getElementById("buscador");
const contenedorItems = document.getElementById("contenedor-items");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const total = document.getElementById("total");
const mensaje = document.getElementById("mensaje");
const estado = document.getElementById("estado");
const aviso = document.getElementById("aviso");

function guardarCatalogo() {
  localStorage.setItem("catalogo", JSON.stringify(catalogo));
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function obtenerProductos() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const guardado = JSON.parse(localStorage.getItem("catalogo"));

        if (!guardado) {
          resolve(productosIniciales);
          return;
        }

        const lista = [];
        for (const { id, nombre, precio, stock } of guardado) {
          lista.push(new Producto(id, nombre, precio, stock));
        }
        resolve(lista);
      } catch (error) {
        reject(new Error("Los datos guardados están dañados"));
      }
    }, 1500);
  });
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function renderizarCatalogo(lista) {
  contenedorItems.innerHTML = "";

  if (lista.length === 0) {
    contenedorItems.innerHTML = `<p class="vacio">No hay productos para mostrar.</p>`;
    return;
  }

  for (const producto of lista) {
    const { id, nombre, precio, stock } = producto;

    contenedorItems.innerHTML += `
      <div class="producto">
        <div>
          <h3>${nombre}</h3>
          <p>$${precio} - ${stock > 0 ? "Stock: " + stock : "Sin stock"}</p>
        </div>
        <div>
          <button id="comprar-${id}">Comprar</button>
          <button id="eliminar-${id}" class="btn-eliminar">Eliminar</button>
        </div>
      </div>`;
  }

  for (const producto of lista) {
    document.getElementById(`comprar-${producto.id}`).addEventListener("click", () => comprar(producto));
    document.getElementById(`eliminar-${producto.id}`).addEventListener("click", () => eliminar(producto));
  }
}

function renderizarCarrito() {
  contenedorCarrito.innerHTML = "";

  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = `<p class="vacio">Tu carrito está vacío.</p>`;
  }

  for (const item of carrito) {
    const { nombre, precioConIva, cantidad } = item;
    contenedorCarrito.innerHTML += `<p>${nombre} x${cantidad} - $${(precioConIva * cantidad).toFixed(2)}</p>`;
  }

  const suma = carrito.reduce((acc, item) => acc + item.precioConIva * item.cantidad, 0);
  const totalFinal = suma - (suma * descuento) / 100;
  total.textContent = "$" + totalFinal.toFixed(2) + (descuento > 0 ? ` (${descuento}% OFF)` : "");
}

function renderizarTodo() {
  const texto = buscador.value.toLowerCase();
  const filtrados = catalogo.filter((p) => p.nombre.toLowerCase().includes(texto));
  renderizarCatalogo(filtrados);
  renderizarCarrito();
}

async function cargarProductos() {
  estado.textContent = "Cargando productos...";
  btnRecargar.disabled = true;

  try {
    catalogo = await obtenerProductos();
    renderizarTodo();
    estado.textContent = `${catalogo.length} productos cargados`;
  } catch (error) {
    estado.textContent = "No se pudieron cargar los productos. Se restablecieron los iniciales.";
    localStorage.removeItem("catalogo");
    catalogo = productosIniciales;
    renderizarTodo();
  } finally {
    btnRecargar.disabled = false;
  }
}

function comprar(producto) {
  if (!producto.vender(1)) {
    mostrarMensaje("No hay stock de " + producto.nombre, "error");
    return;
  }

  const enCarrito = carrito.find((item) => item.id === producto.id);
  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precioConIva: producto.sumarIva(),
      cantidad: 1,
    });
  }

  guardarCatalogo();
  guardarCarrito();
  renderizarTodo();
  mostrarMensaje("Agregaste " + producto.nombre + " al carrito", "ok");
}

function eliminar(producto) {
  const posicion = catalogo.indexOf(producto);
  catalogo.splice(posicion, 1);
  carrito = carrito.filter((item) => item.id !== producto.id);

  guardarCatalogo();
  guardarCarrito();
  renderizarTodo();
  mostrarMensaje("Eliminaste " + producto.nombre, "ok");
}

btnAgregar.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const stock = Number(inputStock.value);

  if (nombre === "" || precio <= 0 || stock <= 0) {
    mostrarMensaje("Completá todos los campos con valores válidos", "error");
    return;
  }

  catalogo.push(new Producto(proximoId, nombre, precio, stock));
  proximoId++;
  localStorage.setItem("proximoId", proximoId);

  inputNombre.value = "";
  inputPrecio.value = "";
  inputStock.value = "";

  guardarCatalogo();
  renderizarTodo();
  mostrarMensaje("Agregaste " + nombre + " al catálogo", "ok");
});

buscador.addEventListener("keyup", renderizarTodo);

btnRecargar.addEventListener("click", cargarProductos);

btnCupon.addEventListener("click", () => {
  const codigo = inputCupon.value.trim().toUpperCase();

  if (codigo === CUPON_VALIDO) {
    descuento = DESCUENTO_CUPON;
    localStorage.setItem("descuento", descuento);
    renderizarCarrito();
    mostrarMensaje("Cupón aplicado: " + DESCUENTO_CUPON + "% de descuento", "ok");
  } else {
    mostrarMensaje("Ese cupón no es válido", "error");
  }
  inputCupon.value = "";
});

btnVaciar.addEventListener("click", () => {
  if (carrito.length === 0) {
    mostrarMensaje("El carrito ya está vacío", "error");
    return;
  }

  for (const { id, cantidad } of carrito) {
    const producto = catalogo.find((p) => p.id === id);
    if (producto) {
      producto.stock += cantidad;
    }
  }
  carrito = [];
  descuento = 0;

  localStorage.removeItem("carrito");
  localStorage.removeItem("descuento");
  guardarCatalogo();
  renderizarTodo();
  mostrarMensaje("Carrito vaciado", "ok");
});

btnReiniciar.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

renderizarCarrito();
cargarProductos();

setTimeout(() => {
  aviso.textContent = `Cupón de bienvenida: usá el código ${CUPON_VALIDO} en el carrito y obtené ${DESCUENTO_CUPON}% de descuento.`;
  aviso.className = "aviso visible";
}, 3000);