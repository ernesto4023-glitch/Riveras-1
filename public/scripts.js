const API_URL = "http://localhost:3000";

const carrito = [];

document.addEventListener("click", e => {
  if (e.target.classList.contains("agregar-carrito")) {
    comprarElemento(e);
  }
});

function comprarElemento(e) {
  const boton = e.target;
  const producto = boton.closest(".producto-card");

  if (!producto) {
    console.error("No se encontró la tarjeta del producto");
    return;
  }

  leerDatosElemento(producto);
}

function leerDatosElemento(producto) {
  const img = producto.querySelector("img");
  const titulo = producto.querySelector("h3");
  const precio = producto.querySelector(".precio");

  if (!img || !titulo || !precio) {
    console.error("Faltan datos en la tarjeta:", producto);
    return;
  }

  const infoProducto = {
    imagen: img.src,
    titulo: titulo.textContent.trim(),
    precio: precio.textContent.trim(),
    cantidad: 1
  };

  carrito.push(infoProducto);
  console.log(carrito);
}
/* =========================
   ADMIN: FLYERS
========================= */

const abrirModalFlyer = document.getElementById("abrirModalFlyer");
const cerrarModalFlyer = document.getElementById("cerrarModalFlyer");
const modalFlyer = document.getElementById("modalFlyer");
const formFlyer = document.getElementById("formFlyer");
const imagenFlyer = document.getElementById("imagenFlyer");
const contenedorFlyers = document.getElementById("contenedorFlyers");

if (
  abrirModalFlyer &&
  cerrarModalFlyer &&
  modalFlyer &&
  formFlyer &&
  imagenFlyer &&
  contenedorFlyers
) {
  abrirModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.add("activo");
  });

  cerrarModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.remove("activo");
  });

  formFlyer.addEventListener("submit", async e => {
    e.preventDefault();

    const archivo = imagenFlyer.files[0];

    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("imagen", archivo);

    await guardarFlyer(formData);

    formFlyer.reset();
    modalFlyer.classList.remove("activo");
  });

  cargarFlyersAdmin();
}

async function guardarFlyer(formData) {
  try {
    const res = await fetch(`${API_URL}/flyers`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el flyer");
  }
}

async function cargarFlyersAdmin() {
  if (!contenedorFlyers) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedorFlyers.innerHTML = flyers.map(flyer => `
      <div class="categoria-card">
        <button class="eliminar-categoria" onclick="eliminarFlyer(${flyer.id})">X</button>
        <img src="${API_URL}/${flyer.imagen}" alt="Flyer">
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
  }
}

async function eliminarFlyer(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este flyer?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/flyers/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el flyer");
  }
}

/* =========================
   INDEX: SWIPER FLYERS
========================= */

async function cargarFlyersIndex() {
  const contenedor = document.getElementById("flyersSwiper");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedor.innerHTML = flyers.map(flyer => `
      <div class="swiper-slide">
        <img src="${API_URL}/${flyer.imagen}" alt="Flyer">
      </div>
    `).join("");

    new Swiper(".header-swiper", {
      loop: flyers.length > 1,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  } catch (error) {
    console.error(error);
  }
}

cargarFlyersIndex();

/* MODAL CATEGORIA */

/* =========================
   ELEMENTOS ADMIN
========================= */

const abrirModalCategoria = document.getElementById("abrirModalCategoria");
const cerrarModalCategoria = document.getElementById("cerrarModalCategoria");
const modalCategoria = document.getElementById("modalCategoria");
const formCategoria = document.getElementById("formCategoria");
const nombreCategoria = document.getElementById("nombreCategoria");
const imagenCategoria = document.getElementById("imagenCategoria");
const contenedorCategorias = document.getElementById("contenedorCategorias");

let categorias = [];

/* =========================
   ADMIN: CATEGORÍAS
========================= */

if (
  abrirModalCategoria &&
  cerrarModalCategoria &&
  modalCategoria &&
  formCategoria &&
  nombreCategoria &&
  imagenCategoria &&
  contenedorCategorias
) {
  abrirModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.add("activo");
  });

  cerrarModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("activo");
  });

  formCategoria.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = nombreCategoria.value.trim();
    const archivo = imagenCategoria.files[0];

    if (!nombre) {
      alert("Escribe el nombre de la categoría");
      return;
    }

    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("imagen", archivo);

    await guardarCategoria(formData);

    formCategoria.reset();
    modalCategoria.classList.remove("activo");
  });

  cargarCategoriasAdmin();
}

async function guardarCategoria(formData) {
  try {
    const res = await fetch(`${API_URL}/categorias`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar la categoría");
    }

    await cargarCategoriasAdmin();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la categoría");
  }
}

async function cargarCategoriasAdmin() {
  try {
    const res = await fetch(`${API_URL}/categorias`);

    if (!res.ok) {
      throw new Error("Error al cargar categorías");
    }

    categorias = await res.json();
    mostrarCategoriasAdmin();
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar las categorías");
  }
}

function mostrarCategoriasAdmin() {
  if (!contenedorCategorias) return;

  contenedorCategorias.innerHTML = "";

  categorias.forEach(categoria => {
    contenedorCategorias.innerHTML += `
      <div class="categoria-card">
        <button class="eliminar-categoria" onclick="eliminarCategoria(${categoria.id})">X</button>
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </div>
    `;
  });
}

async function eliminarCategoria(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta categoría?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la categoría");
    }

    await cargarCategoriasAdmin();
    await cargarCategoriasIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la categoría");
  }
}

/* =========================
   INDEX: CATEGORÍAS
========================= */

async function cargarCategoriasIndex() {
  const contenedor = document.getElementById("categoriasIndex");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);

    if (!res.ok) {
      throw new Error("Error al cargar categorías");
    }

    const categoriasIndex = await res.json();

    contenedor.innerHTML = categoriasIndex.map(categoria => `
      <div class="categoria-card">
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
        <a href="categoria.html?id=${categoria.id}" class="btn-2">
          Ver productos
        </a>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las categorías.</p>";
  }
}

cargarCategoriasIndex();  

/*MODAL PRODUCTOS */

const abrirModalProducto = document.getElementById("abrirModalProducto");
const cerrarModalProducto = document.getElementById("cerrarModalProducto");
const modalProducto = document.getElementById("modalProducto");
const formProducto = document.getElementById("formProducto");

const nombreProducto = document.getElementById("nombreProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const precioProducto = document.getElementById("precioProducto");
const imagenProducto = document.getElementById("imagenProducto");
const contenedorProductosAdmin = document.getElementById("contenedorProductosAdmin");

abrirModalProducto.addEventListener("click", () => {
  modalProducto.classList.add("activo");
  cargarCategoriasEnSelect();
});

cerrarModalProducto.addEventListener("click", () => {
  modalProducto.classList.remove("activo");
});

function cargarCategoriasEnSelect() {
  categoriaProducto.innerHTML = `<option value="">Seleccionar categoría</option>`;

  const transaction = db.transaction(["categorias"], "readonly");
  const store = transaction.objectStore("categorias");
  const request = store.getAll();

  request.onsuccess = () => {
    request.result.forEach(categoria => {
      categoriaProducto.innerHTML += `
        <option value="${categoria.nombre}">
          ${categoria.nombre}
        </option>
      `;
    });
  };
}

formProducto.addEventListener("submit", e => {
  e.preventDefault();

  const archivo = imagenProducto.files[0];

  if (!archivo) return;

  const nuevoProducto = {
    id: Date.now(),
    nombre: nombreProducto.value.trim(),
    categoria: categoriaProducto.value,
    precio: precioProducto.value,
    imagen: archivo
  };

  guardarProducto(nuevoProducto);

  formProducto.reset();
  modalProducto.classList.remove("activo");
});

function guardarProducto(producto) {
  const transaction = db.transaction(["productos"], "readwrite");
  const store = transaction.objectStore("productos");

  store.add(producto);

  transaction.oncomplete = () => {
    cargarProductosAdmin();
  };
}

function cargarProductosAdmin() {
  const transaction = db.transaction(["productos"], "readonly");
  const store = transaction.objectStore("productos");
  const request = store.getAll();

  request.onsuccess = () => {
    mostrarProductosAdmin(request.result);
  };
}

function mostrarProductosAdmin(productos) {
  contenedorProductosAdmin.innerHTML = "";

  productos.forEach(producto => {
    const imagenURL = URL.createObjectURL(producto.imagen);

    contenedorProductosAdmin.innerHTML += `
      <div class="categoria-card">
        <button class="eliminar-categoria" onclick="eliminarProducto(${producto.id})">X</button>
        <img src="${imagenURL}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p class="precio">$${Number(producto.precio).toLocaleString("es-CO")}</p>
        <small>${producto.categoria}</small>
      </div>
    `;
  });
}

function eliminarProducto(id) {
  const transaction = db.transaction(["productos"], "readwrite");
  const store = transaction.objectStore("productos");

  store.delete(id);

  transaction.oncomplete = () => {
    cargarProductosAdmin();
  };
}