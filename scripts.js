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

/*SWIPER */

const headerSwiper = new Swiper(".header-swiper", {
    loop: true,
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