const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://riverashop.net";

let monedaActual = localStorage.getItem("monedaActual") || "COP";
let tasaCambio = 1;

function formatearPrecio(precio) {
  // Asegúrate de que el precio sea un número válido
  const precioNum = parseFloat(precio);

  // Si el precio no es un número, devuelve un valor predeterminado
  if (isNaN(precioNum)) {
    return `$0.00`;  // Precio no válido, mostrar 0.00
  }

  // Si es un número válido, usa .toFixed() para mostrar el precio con hasta 3 decimales
  return `$${precioNum.toFixed(3)}`;  // Muestra el precio con hasta 3 decimales
}

let categoriaEditandoId = null;
let productoEditandoId = null;
let imagenActualProducto = "";
let imagenesActualesProducto = "[]";
let imagenesActualesPreview = [];

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


function editarFlyer(id) {
  flyerEditandoId = id;
  modalFlyer.classList.add("activo");
}

async function guardarFlyer(formData) {
  try {
    const url = flyerEditandoId
      ? `${API_URL}/flyers/${flyerEditandoId}`
      : `${API_URL}/flyers`;

    const method = flyerEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
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

    contenedorFlyers.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Flyer</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Prioridad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${flyers.map(flyer => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${flyer.imagen}" 
                  alt="Flyer"
                  class="flyer-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>Flyer #${flyer.id}</h4>
                    <span>Promocional</span>
                  </div>
                </div>
              </td>

              <td>
                <span class="estado-producto activo">
                  Activo
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <span class="prioridad-media">Media</span>
              </td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarFlyer(${flyer.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button>
                    <i class="bi bi-eye"></i>
                  </button>

                  <button class="delete" onclick="eliminarFlyer(${flyer.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
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
    const url = categoriaEditandoId
      ? `${API_URL}/categorias/${categoriaEditandoId}`
      : `${API_URL}/categorias`;

    const method = categoriaEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
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
  if (!contenedorCategorias) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    contenedorCategorias.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${categorias.map(categoria => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${categoria.imagen}" 
                  alt="${categoria.nombre}"
                  class="categoria-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${categoria.nombre}</h4>
                    <span>ID: ${categoria.id}</span>
                  </div>
                </div>
              </td>

              <td>0</td>

              <td>
                <span class="estado-producto activo">
                  Activa
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">

                  <button onclick="editarCategoria(${categoria.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button class="delete" onclick="eliminarCategoria(${categoria.id})">
                    <i class="bi bi-trash"></i>
                  </button>

                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
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
    categoriaEditandoId = null;
    await cargarCategoriasIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la categoría");
  }
}

async function editarCategoria(id) {
  const res = await fetch(`${API_URL}/categorias`);
  const categorias = await res.json();

  const categoria = categorias.find(c => c.id == id);

  if (!categoria) return;

  categoriaEditandoId = id;
  nombreCategoria.value = categoria.nombre;
  modalCategoria.classList.add("activo");
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
      <a href="catalogo.html?categoria=${categoria.id}" class="categoria-card categoria-link">
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </a>
    `).join("");

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las categorías.</p>";
  }
}

cargarCategoriasIndex(); 

let flyerEditandoId = null;

function editarFlyer(id) {
  flyerEditandoId = id;
  modalFlyer.classList.add("activo");
}


/* =========================
   ADMIN: MODAL PRODUCTOS
========================= */

const abrirModalProducto = document.getElementById("abrirModalProducto");
const cerrarModalProducto = document.getElementById("cerrarModalProducto");
const modalProducto = document.getElementById("modalProducto");
const cancelarProducto = document.getElementById("cancelarProducto");
const formProducto = document.getElementById("formProducto");

const nombreProducto = document.getElementById("nombreProducto");
const precioProducto = document.getElementById("precioProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const marcaProducto = document.getElementById("marcaProducto");
const stockProducto = document.getElementById("stockProducto");
const agregarVarianteProducto = document.getElementById("agregarVarianteProducto");
const listaVariantesProducto = document.getElementById("listaVariantesProducto");

const inputTalla = document.getElementById("inputTalla");
const agregarTalla = document.getElementById("agregarTalla");
const listaTallas = document.getElementById("listaTallas");
const bloqueTallasProducto = document.getElementById("bloqueTallasProducto");
const opcionesTallas = document.getElementById("opcionesTallas");
const editorTallaPersonalizada = document.getElementById("editorTallaPersonalizada");

const bloqueColoresProducto = document.getElementById("bloqueColoresProducto");
const inputColor = document.getElementById("inputColor");
const agregarColor = document.getElementById("agregarColor");
const listaColores = document.getElementById("listaColores");

const imagenesProducto = document.getElementById("imagenesProducto");
const previewGaleria = document.getElementById("previewGaleria");
const contadorImagenes = document.getElementById("contadorImagenes");

const contenedorProductos = document.getElementById("contenedorProductos");

let tallasProducto = [];
let coloresProducto = [];
let imagenesSeleccionadas = [];
let variantesProducto = [];

let usaTallasProducto = true;
let usaColoresProducto = true;
let tipoTallaProducto = "";

const plantillasTallas = {
  "ropa-adulto": ["XS", "S", "M", "L", "XL", "XXL"],
  "ropa-nino": ["2", "4", "6", "8", "10", "12", "14", "16"],
  "ropa-rango": ["2-4", "6-8", "10-12", "14-16"],
  "calzado-adulto": ["35", "36", "37", "38", "39", "40", "41", "42", "43"],
  "calzado-nino": ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34"],
  "anillos": ["5", "6", "7", "8", "9", "10", "11", "12"],
};

/* ABRIR / CERRAR MODAL */

if (abrirModalProducto && modalProducto) {
  abrirModalProducto.addEventListener("click", () => {
    modalProducto.classList.add("activo");
    cargarCategoriasSelectProducto();
  });
}

if (cerrarModalProducto) {
  cerrarModalProducto.addEventListener("click", cerrarModalProductoAdmin);
}

if (cancelarProducto) {
  cancelarProducto.addEventListener("click", cerrarModalProductoAdmin);
}

function cerrarModalProductoAdmin() {
  if (!modalProducto || !formProducto) return;

  modalProducto.classList.remove("activo");
  formProducto.reset();

  productoEditandoId = null;
  imagenActualProducto = "";
  imagenesActualesProducto = "[]";
  imagenesActualesPreview = [];

  tallasProducto = [];
  coloresProducto = [];
  imagenesSeleccionadas = [];
  usaTallasProducto = true;
  usaColoresProducto = true;
  tipoTallaProducto = "";
  tipoProducto = "normal";

  if (bloqueTallasProducto) bloqueTallasProducto.style.display = "block";
  if (bloqueColoresProducto) bloqueColoresProducto.style.display = "block";
  if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "none";
  if (opcionesTallas) opcionesTallas.innerHTML = "";

  document.querySelectorAll("[data-tallas], [data-colores], [data-tipo-talla], [data-tipo-producto]").forEach(btn => {
    btn.classList.remove("activo");
  });

  document.querySelector('[data-tallas="si"]')?.classList.add("activo");
  document.querySelector('[data-colores="si"]')?.classList.add("activo");
  document.querySelector('[data-tipo-producto="normal"]')?.classList.add("activo");

  mostrarTallasSeleccionadas();
  mostrarColoresSeleccionados();
  mostrarPreviewImagenes();
}

/* TALLAS */

document.querySelectorAll("[data-tallas]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tallas]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    usaTallasProducto = btn.dataset.tallas === "si";

    if (bloqueTallasProducto) {
      bloqueTallasProducto.style.display = usaTallasProducto ? "block" : "none";
    }

    if (!usaTallasProducto) {
      tallasProducto = [];
      tipoTallaProducto = "";
      if (opcionesTallas) opcionesTallas.innerHTML = "";
      mostrarTallasSeleccionadas();
    }
  });
});

document.querySelectorAll("[data-tipo-talla]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tipo-talla]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    tipoTallaProducto = btn.dataset.tipoTalla;
    tallasProducto = [];

    if (tipoTallaProducto === "personalizada") {
      if (opcionesTallas) opcionesTallas.innerHTML = "";
      if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "grid";
      mostrarTallasSeleccionadas();
      return;
    }

    if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "none";
    mostrarOpcionesTallas(plantillasTallas[tipoTallaProducto] || []);
  });
});

function mostrarOpcionesTallas(tallas) {
  if (!opcionesTallas) return;

  opcionesTallas.innerHTML = tallas.map(talla => `
    <label class="talla-check">
      <input type="checkbox" value="${talla}" onchange="toggleTallaProducto(this)">
      ${talla}
    </label>
  `).join("");

  mostrarTallasSeleccionadas();
}

function toggleTallaProducto(input) {
  const talla = input.value;

  if (input.checked) {
    if (!tallasProducto.includes(talla)) {
      tallasProducto.push(talla);
    }
  } else {
    tallasProducto = tallasProducto.filter(item => item !== talla);
  }

  mostrarTallasSeleccionadas();
}

if (agregarTalla && inputTalla) {
  agregarTalla.addEventListener("click", agregarNuevaTallaProducto);

  inputTalla.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarNuevaTallaProducto();
    }
  });
}

function agregarNuevaTallaProducto() {
  if (!inputTalla) return;

  const talla = inputTalla.value.trim();

  if (!talla) return;

  if (!tallasProducto.includes(talla)) {
    tallasProducto.push(talla);
  }

  inputTalla.value = "";
  mostrarTallasSeleccionadas();
}

function mostrarTallasSeleccionadas() {
  if (!listaTallas) return;

  listaTallas.innerHTML = tallasProducto.map(talla => `
    <span class="talla-tag">
      ${talla}
      <button type="button" onclick="eliminarTallaProducto('${talla}')">×</button>
    </span>
  `).join("");
}

function eliminarTallaProducto(talla) {
  tallasProducto = tallasProducto.filter(item => item !== talla);

  document.querySelectorAll("#opcionesTallas input").forEach(input => {
    if (input.value === talla) input.checked = false;
  });

  mostrarTallasSeleccionadas();
}

/* COLORES */

document.querySelectorAll("[data-colores]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-colores]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    usaColoresProducto = btn.dataset.colores === "si";

    if (bloqueColoresProducto) {
      bloqueColoresProducto.style.display = usaColoresProducto ? "block" : "none";
    }

    if (!usaColoresProducto) {
      coloresProducto = [];
      mostrarColoresSeleccionados();
    }
  });
});

if (agregarColor && inputColor) {
  agregarColor.addEventListener("click", agregarNuevoColorProducto);

  inputColor.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarNuevoColorProducto();
    }
  });
}

function agregarNuevoColorProducto() {
  if (!inputColor) return;

  const color = inputColor.value.trim();

  if (!color) return;

  if (!coloresProducto.includes(color)) {
    coloresProducto.push(color);
  }

  inputColor.value = "";
  mostrarColoresSeleccionados();
}

function mostrarColoresSeleccionados() {
  if (!listaColores) return;

  listaColores.innerHTML = coloresProducto.map(color => `
    <span class="color-tag">
      ${color}
      <button type="button" onclick="eliminarColorProducto('${color}')">×</button>
    </span>
  `).join("");
}

function eliminarColorProducto(color) {
  coloresProducto = coloresProducto.filter(item => item !== color);
  mostrarColoresSeleccionados();
}

/* IMÁGENES */

if (imagenesProducto) {
  imagenesProducto.addEventListener("change", () => {
    imagenesSeleccionadas = Array.from(imagenesProducto.files).slice(0, 6);
    mostrarPreviewImagenes();
  });
}

function mostrarPreviewImagenes() {
  if (!previewGaleria || !contadorImagenes) return;

  const imagenesPreview = [
    ...imagenesActualesPreview,
    ...imagenesSeleccionadas
  ];

  contadorImagenes.textContent = `${imagenesPreview.length}/6 imágenes`;
  previewGaleria.innerHTML = "";

  imagenesPreview.forEach((imagen, index) => {
    const item = document.createElement("div");

    item.classList.add("preview-item");
    item.draggable = true;
    item.dataset.index = index;

    if (typeof imagen === "string") {
      item.style.backgroundImage = `url(${API_URL}/${imagen})`;
    } else {
      item.style.backgroundImage = `url(${URL.createObjectURL(imagen)})`;
    }

    item.innerHTML = `<span>${index + 1}</span>`;

    item.addEventListener("dragstart", e => {
      e.dataTransfer.setData("index", index);
    });

    item.addEventListener("dragover", e => {
      e.preventDefault();
    });

    item.addEventListener("drop", e => {
      e.preventDefault();

      const indexOrigen = Number(e.dataTransfer.getData("index"));
      const indexDestino = Number(item.dataset.index);

      const imagenMovida = imagenesPreview.splice(indexOrigen, 1)[0];
      imagenesPreview.splice(indexDestino, 0, imagenMovida);

      imagenesActualesPreview = imagenesPreview.filter(img => typeof img === "string");
      imagenesSeleccionadas = imagenesPreview.filter(img => typeof img !== "string");

      imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);
      imagenActualProducto = imagenesActualesPreview[0] || "";

      mostrarPreviewImagenes();
    });

    previewGaleria.appendChild(item);
  });
}

/* CATEGORÍAS EN SELECT */

async function cargarCategoriasSelectProducto() {
  if (!categoriaProducto) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    categoriaProducto.innerHTML = `
      <option value="">Selecciona una categoría</option>
      ${categorias.map(categoria => `
        <option value="${categoria.id}">${categoria.nombre}</option>
      `).join("")}
    `;
  } catch (error) {
    console.error(error);
  }
}

let tipoProducto = "normal";

document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tipo-producto]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    tipoProducto = btn.dataset.tipoProducto;
  });
});

function mostrarVariantesProducto() {
  if (!listaVariantesProducto) return;

  if (variantesProducto.length === 0) {
    listaVariantesProducto.innerHTML = `
      <p class="mini-text">No hay variantes agregadas todavía.</p>
    `;
    return;
  }

  listaVariantesProducto.innerHTML = variantesProducto.map((variante, index) => {
    const colores = variante.colores.length ? variante.colores : ["Sin color"];
    const tallas = variante.tallas.length ? variante.tallas : ["Sin talla"];

    const filas = colores.map(color => `
      <tr>
        <td>${color}</td>

        <td>
          <div class="tallas-tabla-lista">
            ${tallas.map(talla => `
              <span>${talla}</span>
            `).join("")}
          </div>
        </td>

        <td>${variante.stock}</td>
      </tr>
    `).join("");

    return `
      <div class="variante-card">
        <div class="variante-card-header">
          <strong>Variante ${index + 1}</strong>

          <button 
            type="button" 
            onclick="eliminarVarianteProducto(${index})"
          >
            Eliminar
          </button>
        </div>

        <div class="tabla-variantes-scroll">
          <table class="tabla-variantes">
            <thead>
              <tr>
                <th>Color</th>
                <th>Tallas</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

function reiniciarCamposVariante() {
  tallasProducto = [];
  coloresProducto = [];
  tipoTallaProducto = "";

  if (stockProducto) stockProducto.value = "";
  if (inputColor) inputColor.value = "";
  if (inputTalla) inputTalla.value = "";
  if (opcionesTallas) opcionesTallas.innerHTML = "";

  document.querySelectorAll("[data-tipo-talla]").forEach(btn => {
    btn.classList.remove("activo");
  });

  document.querySelectorAll("#opcionesTallas input").forEach(input => {
    input.checked = false;
  });

  if (editorTallaPersonalizada) {
    editorTallaPersonalizada.style.display = "none";
  }

  mostrarTallasSeleccionadas();
  mostrarColoresSeleccionados();
}

function eliminarVarianteProducto(index) {
  variantesProducto.splice(index, 1);
  mostrarVariantesProducto();
}

if (agregarVarianteProducto) {
  agregarVarianteProducto.addEventListener("click", () => {
    const stock = parseInt(stockProducto.value) || 0;

    if (usaTallasProducto && tallasProducto.length === 0) {
      alert("Selecciona mínimo una talla para esta variante");
      return;
    }

    if (usaColoresProducto && coloresProducto.length === 0) {
      alert("Agrega mínimo un color para esta variante");
      return;
    }

    if (stock <= 0) {
      alert("Escribe una cantidad válida para esta variante");
      return;
    }

    const nuevaVariante = {
      tallas: usaTallasProducto ? [...tallasProducto] : [],
      colores: usaColoresProducto ? [...coloresProducto] : [],
      stock
    };

    variantesProducto.push(nuevaVariante);

    mostrarVariantesProducto();
    reiniciarCamposVariante();
  });
}

function obtenerVariantesParaGuardar() {
  const stock = parseInt(stockProducto.value) || 0;

  const sinTallas = !usaTallasProducto;
  const sinColores = !usaColoresProducto;

  // Caso: producto sin tallas y sin colores
  if (sinTallas && sinColores) {
    if (stock <= 0) {
      return {
        error: "Escribe una cantidad válida para el stock del producto."
      };
    }

    return {
      variantes: [
        {
          tallas: [],
          colores: [],
          stock
        }
      ]
    };
  }

  // Caso: producto con tallas o colores
  if (variantesProducto.length === 0) {
    return {
      error: "Agrega mínimo una variante antes de guardar el producto."
    };
  }

  return {
    variantes: variantesProducto
  };
}

/* GUARDAR PRODUCTO */

if (formProducto) {
  formProducto.addEventListener("submit", async e => {
    e.preventDefault();

    const precio = parseFloat(precioProducto.value);

    if (isNaN(precio) || precio <= 0) {
      alert("Precio no válido");
      return;
    }

    if (!productoEditandoId && imagenesSeleccionadas.length === 0) {
      alert("Selecciona mínimo una imagen");
      return;
    }

    const resultadoVariantes = obtenerVariantesParaGuardar();

    if (resultadoVariantes.error) {
      alert(resultadoVariantes.error);
      return;
    }

    const variantesFinales = resultadoVariantes.variantes;

    const formData = new FormData();

    formData.append("nombre", nombreProducto.value.trim());
    formData.append("precio", precio);
    formData.append("descripcion", descripcionProducto.value.trim());
    formData.append("categoria_id", categoriaProducto.value);
    formData.append("marca", marcaProducto.value.trim());
    formData.append("variantes", JSON.stringify(variantesFinales));
    formData.append("tipo_producto", tipoProducto);
    formData.append("imagenActual", imagenActualProducto || imagenesActualesPreview[0] || "");
    formData.append("imagenesActuales", JSON.stringify(imagenesActualesPreview));

    imagenesSeleccionadas.forEach(imagen => {
      formData.append("imagenes", imagen);
    });

    console.log("FORMDATA PRODUCTO:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const url = productoEditandoId
      ? `${API_URL}/productos/${productoEditandoId}`
      : `${API_URL}/productos`;

    const method = productoEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("ERROR BACKEND:", errorData);
        throw new Error("Error al guardar producto");
      }

      await cargarProductosAdmin();
      cerrarModalProductoAdmin();

      alert("Producto guardado correctamente");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto");
    }
  });
}

/* MOSTRAR PRODUCTOS ADMIN */

async function cargarProductosAdmin() {
  if (!contenedorProductos) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    contenedorProductos.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th><input type="checkbox"></th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th> <!-- Aquí mostramos el precio -->
            <th>Stock</th>
            <th>Vendidos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${productos.map(producto => `
            <tr>
              <td><input type="checkbox"></td>

              <td>
                <div class="admin-product-info">
                  <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
                  <div>
                    <h4>${producto.nombre}</h4>
                    <span>SKU: ${producto.sku || "N/A"}</span>
                  </div>
                </div>
              </td>

              <td>${producto.categoria || "Sin categoría"}</td>

              <!-- Usamos la función formatearPrecio para mostrar el precio -->
              <td>${formatearPrecio(producto.precio)}</td> 

              <td class="${Number(producto.stock) <= 5 ? "stock-low" : "stock-ok"}">
                ${producto.stock || 0}
              </td>

              <td>0</td>

              <td>
  <span 
    class="estado-pedido ${normalizarEstadoPedido(pedido.estado) === "Entregado" ? "entregado" : "clickeable"}"
    ${normalizarEstadoPedido(pedido.estado) === "Entregado"
      ? ""
      : `onclick="cambiarEstadoPedido(${pedido.id}, '${normalizarEstadoPedido(pedido.estado)}')"`} 
  >
    ${normalizarEstadoPedido(pedido.estado)}
  </span>
</td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarProducto(${producto.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <a href="producto.html?id=${producto.id}">
                    <i class="bi bi-eye"></i>
                  </a>

                  <button class="delete" onclick="eliminarProducto(${producto.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

// Función para crear la fila de un producto
function crearFilaProducto(producto) {
  const estadoProducto = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const estadoClase = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const stockClase = Number(producto.stock) <= 5 ? "stock-low" : "stock-ok";

  return `
    <tr>
      <td><input type="checkbox"></td>

      <td>
        <div class="admin-product-info">
          <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
          <div>
            <h4>${producto.nombre}</h4>
            <span>SKU: ${producto.sku || "N/A"}</span>
          </div>
        </div>
      </td>

      <td>${producto.categoria || "Sin categoría"}</td>

      <td>${formatearPrecio(producto.precio)}</td>

      <td class="${stockClase}">
        ${producto.stock || 0}
      </td>

      <td>0</td>

      <td>
        <span class="estado-producto ${estadoClase}">
          ${estadoProducto}
        </span>
      </td>

      <td>${new Date().toLocaleDateString()}</td>

      <td>
        <div class="admin-actions">
          <button onclick="editarProducto(${producto.id})">
            <i class="bi bi-pencil"></i>
          </button>

          <a href="producto.html?id=${producto.id}">
            <i class="bi bi-eye"></i>
          </a>

          <button class="delete" onclick="eliminarProducto(${producto.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar producto");
    }

    await cargarProductosAdmin();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el producto");
  }
}
async function editarProducto(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);

    if (!res.ok) {
      throw new Error("Error al obtener el producto");
    }

    const producto = await res.json();

    // =========================
    // Modo edición
    // =========================
    productoEditandoId = id;

    // =========================
    // Imágenes actuales
    // =========================
    imagenActualProducto = producto.imagen || "";
    imagenesActualesProducto = producto.imagenes || "[]";

    try {
      imagenesActualesPreview = producto.imagenes
        ? JSON.parse(producto.imagenes)
        : producto.imagen
          ? [producto.imagen]
          : [];
    } catch (error) {
      imagenesActualesPreview = producto.imagen ? [producto.imagen] : [];
    }

    imagenesSeleccionadas = [];

    // =========================
    // Cargar categorías
    // =========================
    await cargarCategoriasSelectProducto();

    // =========================
    // Datos principales
    // =========================
    nombreProducto.value = producto.nombre || "";
    precioProducto.value = producto.precio || "";
    descripcionProducto.value = producto.descripcion || "";
    categoriaProducto.value = producto.categoria_id || "";
    marcaProducto.value = producto.marca || "";
    tipoProducto = producto.tipo_producto || "normal";

    // =========================
    // Variantes guardadas
    // =========================
    try {
      variantesProducto = producto.variantes
        ? JSON.parse(producto.variantes)
        : [];
    } catch (error) {
      variantesProducto = [];
    }

    // =========================
    // Limpiar selección temporal
    // =========================
    tallasProducto = [];
    coloresProducto = [];

    if (stockProducto) {
      stockProducto.value = "";
    }

    // =========================
    // Restaurar botones tipo producto
    // =========================
    document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
      btn.classList.remove("activo");

      if (btn.dataset.tipoProducto === tipoProducto) {
        btn.classList.add("activo");
      }
    });

    // =========================
    // Pintar información visual
    // =========================
    mostrarTallasSeleccionadas();
    mostrarColoresSeleccionados();
    mostrarVariantesProducto();
    mostrarPreviewImagenes();

    // =========================
    // Abrir modal
    // =========================
    modalProducto.classList.add("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el producto");
  }
}

cargarProductosAdmin();

/* =========================
   INDEX: PRODUCTOS
========================= */

async function cargarProductosIndex() {
  const contenedor = document.getElementById("productosIndex");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const productosLimitados = productos.slice(0, 8);

    contenedor.innerHTML = productosLimitados.map(producto => `
      <a href="producto.html?id=${producto.id}" class="catalogo-card">
        <div class="catalogo-img">
          <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
        </div>

        <div class="catalogo-card-info">
          <h3>${producto.nombre}</h3>
          <strong>${formatearPrecio(producto.precio)}</strong>
          <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
        </div>

        <button 
          type="button"
          class="catalogo-cart btn-carrito-listado" 
          data-id="${producto.id}"
        >
          <i class="bi bi-cart"></i>
        </button>
      </a>
    `).join("");
  } catch (error) {
    console.error(error);
  }
}

cargarProductosIndex();

/* =========================
   PÁGINA DETALLE PRODUCTO
========================= */

let cantidadDetalle = 1;
let tallaSeleccionadaDetalle = "";
let colorSeleccionadoDetalle = "";
let variantesDetalle = [];

async function cargarDetalleProducto() {
  const contenedor = document.getElementById("productoDetalle");

  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    const imagenes = producto.imagenes
      ? JSON.parse(producto.imagenes)
      : [producto.imagen];

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    variantesDetalle = variantes.filter(variante => Number(variante.stock) > 0);

    const coloresDisponibles = [
      ...new Set(
        variantesDetalle.flatMap(variante => variante.colores || [])
      )
    ];

    cantidadDetalle = 1;
    tallaSeleccionadaDetalle = "";
    colorSeleccionadoDetalle = "";

    contenedor.innerHTML = `
      <div class="producto-galeria">
        <div class="producto-miniaturas">
          ${imagenes.map((img, index) => `
            <img 
              src="${API_URL}/${img}" 
              class="${index === 0 ? "activo" : ""}"
              onclick="cambiarImagenProducto('${API_URL}/${img}', this)"
            >
          `).join("")}
        </div>

        <div class="producto-imagen-principal">
          <img id="imagenPrincipalProducto" src="${API_URL}/${imagenes[0]}" alt="${producto.nombre}">
        </div>
      </div>

      <div class="producto-info-detalle">
        <span class="producto-categoria-tag">${producto.categoria}</span>

        <h1>${producto.nombre}</h1>

        <div class="producto-rating">
          ★★★★★ <span>(0 reseñas)</span>
        </div>

        <h2>${formatearPrecio(producto.precio)}</h2>

        <p class="producto-descripcion-detalle">
          ${producto.descripcion || ""}
        </p>

        <hr>
      ${coloresDisponibles.length > 0 ? `
        <div class="producto-opciones">
          <h4>Color</h4>

          <div class="producto-colores-detalle">
            ${coloresDisponibles.map(color => `
              <button 
                type="button"
                class="color-detalle-btn"
                data-color="${color}"
                onclick="seleccionarColorDetalle(this)"
              >
                ${color}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="producto-opciones" id="bloqueTallasDetalle" style="display: none;">
          <h4>Talla</h4>
          <div class="producto-tallas-detalle" id="tallasDetallePorColor"></div>
        </div>
      ` : ""}
        <div class="producto-cantidad">
          <h4>Cantidad</h4>

          <div class="cantidad-control">
            <button type="button" onclick="cambiarCantidadDetalle(-1)">−</button>
            <span id="cantidadDetalle">1</span>
            <button type="button" onclick="cambiarCantidadDetalle(1)">+</button>
          </div>
        </div>

        <div class="producto-botones-detalle">
          <button class="btn-agregar-carrito"><i class="bi bi-cart"></i> Agregar al carrito</button>
          <button class="btn-comprar-ahora">⚡ Comprar ahora</button>
        </div>
      </div>
    `;

    cargarProductosSimilares(producto.categoria_id, producto.id);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudo cargar el producto.</p>";
  }
}

function seleccionarTallaDetalle(boton) {
  document.querySelectorAll(".talla-detalle-btn").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");
  tallaSeleccionadaDetalle = boton.dataset.talla;
}

function seleccionarColorDetalle(boton) {
  document.querySelectorAll(".color-detalle-btn").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");

  colorSeleccionadoDetalle = boton.dataset.color;
  tallaSeleccionadaDetalle = "";

  const bloqueTallas = document.getElementById("bloqueTallasDetalle");
  const contenedorTallas = document.getElementById("tallasDetallePorColor");

  if (!bloqueTallas || !contenedorTallas) return;

  const tallasDisponibles = [
    ...new Set(
      variantesDetalle
        .filter(variante =>
          Number(variante.stock) > 0 &&
          Array.isArray(variante.colores) &&
          variante.colores.includes(colorSeleccionadoDetalle)
        )
        .flatMap(variante => variante.tallas || [])
    )
  ];

  if (tallasDisponibles.length === 0) {
    bloqueTallas.style.display = "none";
    contenedorTallas.innerHTML = "";
    return;
  }

  bloqueTallas.style.display = "block";

  contenedorTallas.innerHTML = tallasDisponibles.map(talla => `
    <button 
      type="button"
      class="talla-detalle-btn"
      data-talla="${talla}"
      onclick="seleccionarTallaDetalle(this)"
    >
      ${talla}
    </button>
  `).join("");
}

function cambiarImagenProducto(src, elemento) {
  document.getElementById("imagenPrincipalProducto").src = src;

  document.querySelectorAll(".producto-miniaturas img").forEach(img => {
    img.classList.remove("activo");
  });

  elemento.classList.add("activo");
}

function cambiarCantidadDetalle(valor) {
  cantidadDetalle += valor;

  if (cantidadDetalle < 1) cantidadDetalle = 1;

  document.getElementById("cantidadDetalle").textContent = cantidadDetalle;
}

async function cargarProductosSimilares(categoriaId, productoActualId) {
  const contenedor = document.getElementById("productosSimilares");

  if (!contenedor) return;

  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();

  const similares = productos.filter(producto =>
    producto.categoria_id == categoriaId && producto.id != productoActualId
  );

  contenedor.innerHTML = similares.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
      </div>
    </a>
  `).join("");
}

cargarDetalleProducto();
/* =========================
   CATALOGO
========================= */

let productosCatalogoData = [];
let categoriaActivaCatalogo = "todos";

async function cargarCatalogo() {
  const contenedor = document.getElementById("productosCatalogo");
  const filtros = document.getElementById("filtrosCategorias");

  if (!contenedor || !filtros) return;

  try {
    const resProductos = await fetch(`${API_URL}/productos`);
    const resCategorias = await fetch(`${API_URL}/categorias`);

    const todosLosProductos = await resProductos.json();
    productosCatalogoData = todosLosProductos.filter(producto =>
      producto.tipo_producto !== "preventa"
    );

    const categorias = await resCategorias.json();

    filtros.innerHTML = `
      <button 
        class="activo" 
        data-categoria="todos"
        onclick="filtrarCatalogoCategoria('todos', this)"
      >
        Todos los productos <span>${productosCatalogoData.length}</span>
      </button>

      ${categorias.map(categoria => {
        const total = productosCatalogoData.filter(p => p.categoria_id == categoria.id).length;

        return `
          <button 
            data-categoria="${categoria.id}"
            onclick="filtrarCatalogoCategoria('${categoria.id}', this)"
          >
            ${categoria.nombre} <span>${total}</span>
          </button>
        `;
      }).join("")}
    `;

    const params = new URLSearchParams(window.location.search);
    const categoriaURL = params.get("categoria");

    if (categoriaURL) {
      categoriaActivaCatalogo = categoriaURL;

      const botonCategoria = document.querySelector(
        `.filtros-categorias button[data-categoria="${categoriaURL}"]`
      );

      document.querySelectorAll(".filtros-categorias button").forEach(btn => {
        btn.classList.remove("activo");
      });

      if (botonCategoria) {
        botonCategoria.classList.add("activo");
      }

      aplicarFiltrosCatalogo();
    } else {
      pintarCatalogo(productosCatalogoData);
    }

  } catch (error) {
    console.error(error);
  }
}

function pintarCatalogo(productos) {
  const contenedor = document.getElementById("productosCatalogo");
  const contador = document.getElementById("contadorCatalogo");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} productos`;
  }

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
    </a>
  `).join("");
}

function filtrarCatalogoCategoria(categoriaId, boton) {
  categoriaActivaCatalogo = categoriaId;

  document.querySelectorAll(".filtros-categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");

  aplicarFiltrosCatalogo();
}

function aplicarFiltrosCatalogo() {
  let productos = [...productosCatalogoData];

  if (categoriaActivaCatalogo !== "todos") {
    productos = productos.filter(producto => producto.categoria_id == categoriaActivaCatalogo);
  }

  const min = Number(document.getElementById("precioMin")?.value || 0);
  const max = Number(document.getElementById("precioMax")?.value || 0);

  if (min > 0) {
    productos = productos.filter(producto => Number(producto.precio) >= min);
  }

  if (max > 0) {
    productos = productos.filter(producto => Number(producto.precio) <= max);
  }

  const orden = document.getElementById("ordenCatalogo")?.value;

  if (orden === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (orden === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (orden === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarCatalogo(productos);
}

document.getElementById("filtrarPrecio")?.addEventListener("click", aplicarFiltrosCatalogo);
document.getElementById("ordenCatalogo")?.addEventListener("change", aplicarFiltrosCatalogo);

document.getElementById("buscarCatalogo")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const productos = productosCatalogoData.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.descripcion?.toLowerCase().includes(texto)
  );

  pintarCatalogo(productos);
});

cargarCatalogo();

/* =========================
   CARRITO GLOBAL
========================= */

let carritoProductos = JSON.parse(localStorage.getItem("carritoProductos")) || [];

function crearModalCarritoSiNoExiste() {
  if (document.getElementById("modalCarrito")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <button id="btnCarritoFlotante" class="carrito-flotante">
      <i class="bi bi-cart"></i> <span id="contadorCarrito">0</span>
    </button>

    <div id="modalCarrito" class="modal-carrito">
      <div class="modal-carrito-content">
        <span id="cerrarModalCarrito" class="cerrar-carrito">&times;</span>
        <h2>Carrito de compras</h2>
        <div id="listaCarritoModal" class="lista-carrito-modal"></div>

        <div class="carrito-total-box">
          <span>Total:</span>
          <strong id="totalCarrito">$0</strong>
        </div>

        <button class="btn-finalizar-compra">
          Finalizar compra
        </button>
      </div>
    </div>
  `);
}

crearModalCarritoSiNoExiste();

document.addEventListener("click", async e => {
  const btnFlotante = e.target.closest("#btnCarritoFlotante");
  const btnCerrar = e.target.closest("#cerrarModalCarrito");
  const btnDetalle = e.target.closest(".btn-agregar-carrito");
  const btnListado = e.target.closest(".btn-carrito-listado");

  if (btnFlotante) {
    document.getElementById("modalCarrito").classList.add("activo");
    pintarCarritoModal();
    return;
  }

  if (btnCerrar) {
    document.getElementById("modalCarrito").classList.remove("activo");
    return;
  }

  if (btnDetalle) {
  e.preventDefault();
  e.stopPropagation();

  agregarProductoDetalleAlCarrito();
  return;
}

if (btnListado) {
  e.preventDefault();
  e.stopPropagation();

  const id = btnListado.dataset.id;
  await agregarProductoListadoAlCarrito(id);
  return;
}
});

async function agregarProductoListadoAlCarrito(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    const variantesDisponibles = variantes.filter(variante => Number(variante.stock) > 0);

    // Si tiene variantes, debe ir al detalle para escoger color y talla
    if (variantesDisponibles.length > 0) {
      window.location.href = `producto.html?id=${producto.id}`;
      return;
    }

    // Si no tiene variantes, sí se puede agregar directo
    carritoProductos.push({
      id: Date.now(),
      producto_id: producto.id,
      nombre: producto.nombre,
      imagen: `${API_URL}/${producto.imagen}`,
      precio: Number(producto.precio),
      cantidad: 1,
      talla: "",
      color: "",
    });

    guardarCarrito();
    pintarCarritoModal();

  } catch (error) {
    console.error(error);
    alert("No se pudo agregar el producto");
  }
}

function agregarProductoDetalleAlCarrito() {
  const nombre = document.querySelector(".producto-info-detalle h1")?.textContent.trim();
  const precioTexto = document.querySelector(".producto-info-detalle h2")?.textContent.replace(/[^\d]/g, "");
  const imagen = document.getElementById("imagenPrincipalProducto")?.src;

  const precio = Number(precioTexto);
  const cantidad = cantidadDetalle || 1;

  if (!nombre || !precio || !imagen) {
    alert("No se pudo agregar el producto");
    return;
  }

  if (variantesDetalle.length > 0 && !colorSeleccionadoDetalle) {
    alert("Selecciona un color");
    return;
  }

  if (variantesDetalle.length > 0 && !tallaSeleccionadaDetalle) {
    alert("Selecciona una talla");
    return;
  }

  carritoProductos.push({
    id: Date.now(),
    nombre,
    imagen,
    precio,
    cantidad,
    talla: tallaSeleccionadaDetalle || "",
    color: colorSeleccionadoDetalle || "",
  });

  guardarCarrito();
  pintarCarritoModal();
}

function pintarCarritoModal() {
  const listaCarritoModal = document.getElementById("listaCarritoModal");

  if (!listaCarritoModal) return;

  if (carritoProductos.length === 0) {
    listaCarritoModal.innerHTML = "<p>Tu carrito está vacío.</p>";
    actualizarTotalesCarrito();
    return;
  }

  listaCarritoModal.innerHTML = carritoProductos.map(producto => `
    <div class="item-carrito">
      <img src="${producto.imagen}" alt="${producto.nombre}">

      <div class="item-carrito-info">
        <h4>${producto.nombre}</h4>

        ${producto.talla ? `<p>Talla: ${producto.talla}</p>` : ""}
        ${producto.color ? `<p>Color: ${producto.color}</p>` : ""}

        <div class="item-carrito-precios">
          <p>Precio unitario: <strong>$${producto.precio.toLocaleString()}</strong></p>
          <p>Total: <strong>$${(producto.precio * producto.cantidad).toLocaleString()}</strong></p>
        </div>

        <div class="item-carrito-actions">
          <button onclick="cambiarCantidadCarrito(${producto.id}, -1)">−</button>
          <span>${producto.cantidad}</span>
          <button onclick="cambiarCantidadCarrito(${producto.id}, 1)">+</button>
          <button class="btn-eliminar-item" onclick="eliminarProductoCarrito(${producto.id})">🗑</button>
        </div>
      </div>
    </div>
  `).join("");

  actualizarTotalesCarrito();
}

function cambiarCantidadCarrito(id, valor) {
  carritoProductos = carritoProductos.map(producto => {
    if (producto.id === id) {
      producto.cantidad += valor;
      if (producto.cantidad < 1) producto.cantidad = 1;
    }
    return producto;
  });

  guardarCarrito();
  pintarCarritoModal();
}

function eliminarProductoCarrito(id) {
  carritoProductos = carritoProductos.filter(producto => producto.id !== id);
  guardarCarrito();
  pintarCarritoModal();
}
function actualizarTotalesCarrito() {
  const cantidadTotal = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.cantidad);
  }, 0);

  const precioTotal = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.precio) * Number(producto.cantidad);
  }, 0);

  document.querySelectorAll("#contadorCarrito").forEach(contador => {
    contador.textContent = cantidadTotal;
  });

  document.querySelectorAll("#totalCarrito").forEach(total => {
    total.textContent = `$${precioTotal.toLocaleString()}`;
  });
}

function guardarCarrito() {
  localStorage.setItem("carritoProductos", JSON.stringify(carritoProductos));
  actualizarTotalesCarrito();
}

actualizarTotalesCarrito();

/*MODAL PERSONAL SHOPPER */

const abrirModalServicio = document.getElementById("abrirModalServicio");
const cerrarModalServicio = document.getElementById("cerrarModalServicio");
const modalServicio = document.getElementById("modalServicio");
const formServicio = document.getElementById("formServicio");

if (abrirModalServicio && modalServicio) {
  abrirModalServicio.addEventListener("click", () => {
    modalServicio.classList.add("activo");
  });
}

if (cerrarModalServicio && modalServicio) {
  cerrarModalServicio.addEventListener("click", () => {
    modalServicio.classList.remove("activo");
  });
}

if (formServicio) {
  formServicio.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombreServicio").value.trim();
    const whatsapp = document.getElementById("whatsappServicio").value.trim();
    const correo = document.getElementById("correoServicio").value.trim();
    const mensaje = document.getElementById("mensajeServicio").value.trim();

    const numeroDestino = "+19095447605";

    const texto = `Hola, soy ${nombre}.%0A%0AQuiero solicitar el servicio de Personal Shopper.%0A%0A${mensaje}%0A%0AMi WhatsApp es: ${whatsapp}%0AMi correo es: ${correo}`;

    window.open(`https://wa.me/${numeroDestino}?text=${texto}`, "_blank");

    formServicio.reset();
    modalServicio.classList.remove("activo");
  });
}

/* =========================
   PREVENTA
========================= */

let productosPreventaData = [];

async function cargarPreventa() {
  const contenedor = document.getElementById("productosPreventa");
  const contador = document.getElementById("contadorPreventa");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    productosPreventaData = productos.filter(producto => 
      producto.tipo_producto === "preventa"
    );

    pintarPreventa(productosPreventaData);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar los productos en preventa.</p>";
  }
}

function pintarPreventa(productos) {
  const contenedor = document.getElementById("productosPreventa");
  const contador = document.getElementById("contadorPreventa");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} productos en preventa`;
  }

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">Preventa</div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
    </a>
  `).join("");
}

document.getElementById("ordenPreventa")?.addEventListener("change", e => {
  let productos = [...productosPreventaData];

  if (e.target.value === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (e.target.value === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (e.target.value === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarPreventa(productos);
});

document.getElementById("buscarPreventa")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const productos = productosPreventaData.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.descripcion?.toLowerCase().includes(texto)
  );

  pintarPreventa(productos);
});

cargarPreventa();

/* =========================
   NOVEDADES
========================= */

let productosNovedadesData = [];

async function cargarNovedades() {
  const contenedor = document.getElementById("productosNovedades");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() - 4);

    productosNovedadesData = productos.filter(producto => {
      const fechaProducto = new Date(producto.created_at);
      return fechaProducto >= limite;
    });

    pintarNovedades(productosNovedadesData);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las novedades.</p>";
  }
}

function pintarNovedades(productos) {
  const contenedor = document.getElementById("productosNovedades");
  const contador = document.getElementById("contadorNovedades");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} novedades`;
  }

  contenedor.innerHTML = productos.map(producto => `
      <a href="producto.html?id=${producto.id}" class="catalogo-card">
      ${producto.tipo_producto === "preventa" ? `
      <span class="badge-preventa">Preventa</span>
    ` : ""} 
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">Nuevo</div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
    </a>
  `).join("");
}

document.getElementById("ordenNovedades")?.addEventListener("change", e => {
  let productos = [...productosNovedadesData];

  if (e.target.value === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (e.target.value === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (e.target.value === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarNovedades(productos);
});

document.getElementById("buscarNovedades")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const productos = productosNovedadesData.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.descripcion?.toLowerCase().includes(texto)
  );

  pintarNovedades(productos);
});

cargarNovedades();

// INICIAR MONEDA
async function iniciarMoneda() {
  // Ya no es necesario cargar la tasa de cambio desde el servidor
  tasaCambio = 1;  // Establecer tasa fija a 1

  const inputTasa = document.getElementById("tasaCambioInput");
  if (inputTasa) inputTasa.value = tasaCambio;

  // No necesitas más botones de cambio de moneda
  document.getElementById("btnCOP")?.classList.toggle("active", true);  // Mantener COP siempre activo
  document.getElementById("btnUSD")?.classList.toggle("active", false); // Desactivar USD
}

iniciarMoneda();


/* =========================
   CHECKOUT / PEDIDOS
========================= */

const modalCheckout = document.getElementById("modalCheckout");
const cerrarCheckout = document.getElementById("cerrarCheckout");
const formCheckout = document.getElementById("formCheckout");

document.addEventListener("click", e => {
  const btnCheckout = e.target.closest(".btn-finalizar-compra");

  if (btnCheckout && modalCheckout) {
    modalCheckout.classList.add("activo");
  }
});

cerrarCheckout?.addEventListener("click", () => {
  modalCheckout.classList.remove("activo");
});

formCheckout?.addEventListener("submit", async e => {
  e.preventDefault();

  if (carritoProductos.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  const totalPedido = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.precio) * Number(producto.cantidad);
  }, 0);

  const formData = new FormData();

  formData.append("nombre", document.getElementById("checkoutNombre").value.trim());
  formData.append("whatsapp", document.getElementById("checkoutWhatsapp").value.trim());
  formData.append("correo", document.getElementById("checkoutCorreo").value.trim());
  formData.append("direccion", document.getElementById("checkoutDireccion").value.trim());
  formData.append("ciudad", document.getElementById("checkoutCiudad").value.trim());
  formData.append("metodo_pago", document.getElementById("checkoutMetodoPago").value);
  formData.append("notas", document.getElementById("checkoutNotas").value.trim());
  formData.append("productos", JSON.stringify(carritoProductos));
  formData.append("total", totalPedido);
  formData.append("moneda", "USD");

  const comprobante = document.getElementById("checkoutComprobante").files[0];

  if (comprobante) {
    formData.append("comprobante", comprobante);
  }

  try {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Error al crear pedido");
    }

    alert("Pedido enviado correctamente. Revisaremos tu pago y te contactaremos por WhatsApp.");

    carritoProductos = [];
    guardarCarrito();
    pintarCarritoModal();

    formCheckout.reset();
    modalCheckout.classList.remove("activo");
    document.getElementById("modalCarrito")?.classList.remove("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo enviar el pedido");
  }
});

/* =========================
   ADMIN: PEDIDOS
========================= */

async function cargarPedidosAdmin() {
  const contenedor = document.getElementById("contenedorPedidos");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/pedidos`);
    const pedidos = await res.json();
    const pendientes = pedidos.filter(pedido => pedido.estado === "pendiente").length;

const contadorPendientes = document.getElementById("contadorPedidosPendientes");

if (contadorPendientes) {
  contadorPendientes.textContent = pendientes;
}

    contenedor.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Método</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${pedidos.map(pedido => `
            <tr>
              <td>#${pedido.id}</td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${pedido.nombre}</h4>
                    <span>${pedido.correo || "Sin correo"}</span>
                  </div>
                </div>
              </td>

              <td>${pedido.whatsapp}</td>

              <td>${pedido.metodo_pago}</td>

              <td>$${Number(pedido.total).toLocaleString()} ${pedido.moneda}</td>

              <td>
                <span 
                  class="estado-pedido ${pedido.estado === "Entregado" ? "entregado" : "clickeable"}"
                  ${pedido.estado === "Entregado" ? "" : `onclick="cambiarEstadoPedido(${pedido.id}, '${pedido.estado || "Activo"}')"`} 
                >
                  ${pedido.estado || "Activo"}
                </span>
              </td>

              <td>
                ${pedido.comprobante ? `
                  <a 
                    href="${API_URL}/${pedido.comprobante}" 
                    target="_blank" 
                    class="link-comprobante"
                  >
                    Ver comprobante
                  </a>
                ` : "Sin comprobante"}
              </td>

              <td>${new Date(pedido.created_at).toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">
                  <button onclick="verificarPedido(${pedido.id}, '${pedido.whatsapp}', '${pedido.nombre}')">
                    <i class="bi bi-check-lg"></i>
                  </button>

                  <button onclick='verDetallePedido(${JSON.stringify(pedido.productos)})'>
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}

function normalizarEstadoPedido(estado) {
  if (!estado || estado === "pendiente") return "Activo";
  if (estado === "verificado") return "Revisado";
  return estado;
}

function obtenerSiguienteEstado(estadoActual) {
  const estados = ["Activo", "Revisado", "En camino", "Entregado"];

  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const indexActual = estados.indexOf(estadoNormalizado);

  if (indexActual === -1) return "Activo";
  if (indexActual >= estados.length - 1) return null;

  return estados[indexActual + 1];
}

async function cambiarEstadoPedido(id, estadoActual) {
  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const siguienteEstado = obtenerSiguienteEstado(estadoNormalizado);

  if (!siguienteEstado) return;

  const confirmar = await Swal.fire({
    title: "¿Cambiar estado?",
    text: `El pedido pasará de "${estadoNormalizado}" a "${siguienteEstado}".`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cambiar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e0be32",
    cancelButtonColor: "#333"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: siguienteEstado
      })
    });

    if (!res.ok) {
      throw new Error("Error al actualizar estado");
    }

    await cargarPedidosAdmin();

    Swal.fire({
      title: "Estado actualizado",
      text: `El pedido ahora está en "${siguienteEstado}".`,
      icon: "success",
      confirmButtonColor: "#e0be32"
    });

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "No se pudo actualizar el estado del pedido.",
      icon: "error",
      confirmButtonColor: "#e0be32"
    });
  }
}

function verDetallePedido(productosJSON) {
  const productos = typeof productosJSON === "string"
    ? JSON.parse(productosJSON)
    : productosJSON;

  const detalle = productos.map(producto => {
    return `${producto.nombre} | Cantidad: ${producto.cantidad} | Talla: ${producto.talla || "N/A"} | Color: ${producto.color || "N/A"}`;
  }).join("\n");

  alert(detalle);
}

cargarPedidosAdmin();

document.addEventListener("click", e => {
  const btn = e.target.closest("#btnMenuMobile");

  if (!btn) return;

  const navbar = document.getElementById("navbarMobile");

  if (navbar) {
    navbar.classList.toggle("activo");
  }
});

/*METODO DE PAGO */

document.querySelectorAll("[data-metodo-pago]").forEach(btn => {
  btn.addEventListener("click", () => {
    const metodo = btn.dataset.metodoPago;
    const inputMetodo = document.getElementById("checkoutMetodoPago");
    const info = document.getElementById("infoMetodoPago");

    document.querySelectorAll("[data-metodo-pago]").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");
    inputMetodo.value = metodo;

    if (metodo === "Nequi") {
      info.innerHTML = `
        <strong>Pago por Nequi</strong><br>
        Número: 322 334 9682<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Bancolombia") {
      info.innerHTML = `
        <strong>Pago por Bancolombia</strong><br>
        Cuenta de ahorros: 59726688871<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Contra entrega") {
      info.innerHTML = `
        <strong>Pago contra entrega</strong><br>
        Pagas al recibir tu pedido.<br>
        No necesitas subir comprobante.
      `;
    }
  });
});