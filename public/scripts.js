const API_URL = "http://localhost:3000";

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
const skuProducto = document.getElementById("skuProducto");

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

  tallasProducto = [];
  coloresProducto = [];
  imagenesSeleccionadas = [];
  usaTallasProducto = true;
  usaColoresProducto = true;
  tipoTallaProducto = "";

  if (bloqueTallasProducto) bloqueTallasProducto.style.display = "block";
  if (bloqueColoresProducto) bloqueColoresProducto.style.display = "block";
  if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "none";
  if (opcionesTallas) opcionesTallas.innerHTML = "";

  document.querySelectorAll("[data-tallas], [data-colores], [data-tipo-talla]").forEach(btn => {
    btn.classList.remove("activo");
  });

  document.querySelector('[data-tallas="si"]')?.classList.add("activo");
  document.querySelector('[data-colores="si"]')?.classList.add("activo");

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

  contadorImagenes.textContent = `${imagenesSeleccionadas.length}/6 imágenes`;
  previewGaleria.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const item = document.createElement("div");

    if (imagenesSeleccionadas[i]) {
      item.style.backgroundImage = `url(${URL.createObjectURL(imagenesSeleccionadas[i])})`;
    }

    previewGaleria.appendChild(item);
  }
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

  contadorImagenes.textContent = `${imagenesSeleccionadas.length}/6 imágenes`;
  previewGaleria.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const item = document.createElement("div");

    if (imagenesSeleccionadas[i]) {
      item.style.backgroundImage = `url(${URL.createObjectURL(imagenesSeleccionadas[i])})`;
    }

    previewGaleria.appendChild(item);
  }
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

/* GUARDAR PRODUCTO */

if (formProducto) {
  formProducto.addEventListener("submit", async e => {
    e.preventDefault();

    if (imagenesSeleccionadas.length === 0) {
      alert("Selecciona mínimo una imagen");
      return;
    }

    const formData = new FormData();

    formData.append("nombre", nombreProducto.value.trim());
    formData.append("precio", precioProducto.value);
    formData.append("descripcion", descripcionProducto.value.trim());
    formData.append("categoria_id", categoriaProducto.value);
    formData.append("marca", marcaProducto.value.trim());
    formData.append("stock", stockProducto.value);
    formData.append("sku", skuProducto.value.trim());
    formData.append("usa_tallas", usaTallasProducto ? "1" : "0");
    formData.append("tipo_talla", tipoTallaProducto);
    formData.append("tallas", JSON.stringify(tallasProducto));

    formData.append("usa_colores", usaColoresProducto ? "1" : "0");
    formData.append("colores", JSON.stringify(coloresProducto));

    imagenesSeleccionadas.forEach(imagen => {
      formData.append("imagenes", imagen);
    });

    try {
      const res = await fetch(`${API_URL}/productos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
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

    contenedorProductos.innerHTML = productos.map(producto => `
      <div class="producto-admin-card">
        <a href="producto.html?id=${producto.id}" class="producto-card-link">
          <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">

          <div class="producto-admin-info">
            <h3>${producto.nombre}</h3>
            <strong>$${Number(producto.precio).toLocaleString()}</strong>
            <p>${producto.descripcion || ""}</p>
          </div>
        </a>

        <div class="producto-card-actions">
          <button class="btn-editar" onclick="event.preventDefault(); editarProducto(${producto.id})">✏️</button>
          <button class="btn-eliminar" onclick="event.preventDefault(); eliminarProducto(${producto.id})">🗑️</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
  }
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

function editarProducto(id) {
  alert("Luego conectamos la edición del producto ID: " + id);
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
          <strong>$${Number(producto.precio).toLocaleString()}</strong>
          <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
        </div>

        <button 
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

    const tallas = producto.tallas
      ? JSON.parse(producto.tallas)
      : [];

    const colores = producto.colores
      ? JSON.parse(producto.colores)
      : [];

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

        <h2>$${Number(producto.precio).toLocaleString()}</h2>

        <p class="producto-descripcion-detalle">
          ${producto.descripcion || ""}
        </p>

        <hr>

        ${producto.usa_tallas == 1 && tallas.length > 0 ? `
          <div class="producto-opciones">
            <h4>Talla</h4>

            <div class="producto-tallas-detalle">
              ${tallas.map(talla => `
                <button 
                  type="button"
                  class="talla-detalle-btn"
                  data-talla="${talla}"
                  onclick="seleccionarTallaDetalle(this)"
                >
                  ${talla}
                </button>
              `).join("")}
            </div>
          </div>
        ` : ""}

        ${producto.usa_colores == 1 && colores.length > 0 ? `
          <div class="producto-opciones">
            <h4>Color</h4>

            <div class="producto-colores-detalle">
              ${colores.map(color => `
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
        <strong>$${Number(producto.precio).toLocaleString()}</strong>
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

    productosCatalogoData = await resProductos.json();
    const categorias = await resCategorias.json();

    filtros.innerHTML = `
      <button class="activo" onclick="filtrarCatalogoCategoria('todos', this)">
        Todos los productos <span>${productosCatalogoData.length}</span>
      </button>
      ${categorias.map(categoria => {
        const total = productosCatalogoData.filter(p => p.categoria_id == categoria.id).length;

        return `
          <button onclick="filtrarCatalogoCategoria('${categoria.id}', this)">
            ${categoria.nombre} <span>${total}</span>
          </button>
        `;
      }).join("")}
    `;

    pintarCatalogo(productosCatalogoData);
  } catch (error) {
    console.error(error);
  }
}

function pintarCatalogo(productos) {
  const contenedor = document.getElementById("productosCatalogo");
  const contador = document.getElementById("contadorCatalogo");

  if (!contenedor) return;

  contador.textContent = `Mostrando ${productos.length} productos`;

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>$${Number(producto.precio).toLocaleString()}</strong>
        <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
      </div>

      <button 
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
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
    agregarProductoDetalleAlCarrito();
    return;
  }

  if (btnListado) {
    e.preventDefault();
    const id = btnListado.dataset.id;
    await agregarProductoListadoAlCarrito(id);
  }
});

async function agregarProductoListadoAlCarrito(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

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
    document.getElementById("modalCarrito").classList.add("activo");
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
  document.getElementById("modalCarrito").classList.add("activo");
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
  const contadorCarrito = document.getElementById("contadorCarrito");
  const totalCarrito = document.getElementById("totalCarrito");

  const cantidadTotal = carritoProductos.reduce((total, producto) => total + producto.cantidad, 0);
  const precioTotal = carritoProductos.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);

  if (contadorCarrito) contadorCarrito.textContent = cantidadTotal;
  if (totalCarrito) totalCarrito.textContent = `$${precioTotal.toLocaleString()}`;
}

function guardarCarrito() {
  localStorage.setItem("carritoProductos", JSON.stringify(carritoProductos));
  actualizarTotalesCarrito();
}

actualizarTotalesCarrito();