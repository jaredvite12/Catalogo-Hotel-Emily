// Elementos del DOM
const btnMenu = document.getElementById('btn-abrir-menu');
const menuLateral = document.getElementById('menu');
const fondoMenu = document.getElementById('fondo-menu');
const cabecerasAcordeon = document.querySelectorAll('.acordeon-cabecera');

const idiomaDesdeUrl = new URLSearchParams(window.location.search).get('lang');
if (idiomaDesdeUrl === 'es' || idiomaDesdeUrl === 'en') {
  localStorage.setItem('idiomaSeleccionado', idiomaDesdeUrl);
}

// Inicializa el selector de idioma de Google Translate. ------------------------------------------
window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'es',
    includedLanguages: 'es,en',
    autoDisplay: false
  }, 'google_translate_element');

  const idiomaGuardado = localStorage.getItem('idiomaSeleccionado');
  if (idiomaGuardado) {
    [200, 800, 1600].forEach(retraso => {
      setTimeout(() => cambiarIdioma(idiomaGuardado), retraso);
    });
  }
};

// Cambiar Idioma ---------------------------------------------------------------------
function cambiarIdioma(idioma) {
  const selectorGoogle = document.querySelector('.goog-te-combo');

  if (!selectorGoogle) {
    setTimeout(() => cambiarIdioma(idioma), 100);
    return;
  }

  // Guardamos tu preferencia localmente
  localStorage.setItem('idiomaSeleccionado', idioma);

  if (idioma === 'es') {
    // 1. Borramos cualquier rastro de la cookie de Google Translate
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
    
    // 2. Si el selector de Google tiene un valor (es decir, si estábamos en inglés), 
    // recargamos la página para limpiar las alteraciones que Google le hizo al DOM.
    if (selectorGoogle.value !== '') {
      window.location.reload();
    }
  } else {
    // Si vamos a Inglés (o cualquier otro idioma ajeno al base)
    document.cookie = `googtrans=/es/${idioma}; path=/`;
    selectorGoogle.value = idioma;
    selectorGoogle.dispatchEvent(new Event('change'));
  }

  // Actualizamos la clase activa en los botones
  document.querySelectorAll('.boton-idioma').forEach(boton => {
    boton.classList.toggle('activo', boton.dataset.idioma === idioma);
  });

  document.body.style.top = '0';
}

document.addEventListener('click', evento => {
  const botonIdioma = evento.target.closest('.boton-idioma');

  if (botonIdioma) {
    cambiarIdioma(botonIdioma.dataset.idioma);
    return;
  }

  const enlaceInterno = evento.target.closest('a[href]');
  if (!enlaceInterno || enlaceInterno.target === '_blank') return;

  const urlEnlace = new URL(enlaceInterno.href, window.location.href);
  const idiomaActual = localStorage.getItem('idiomaSeleccionado');

  if (idiomaActual && urlEnlace.pathname.endsWith('.html')) {
    evento.preventDefault();
    urlEnlace.searchParams.set('lang', idiomaActual);
    window.location.assign(urlEnlace.href);
  }
});

// Función para abrir/cerrar el menú lateral
function alternarMenu() {
  menuLateral.classList.toggle('abierto');
  if (menuLateral.classList.contains('abierto')) {
    fondoMenu.style.display = 'block';
    btnMenu.innerText = 'x';
  } else {
    fondoMenu.style.display = 'none';
    btnMenu.innerText = '☰'; // Lo regresamos al icono de hamburguesa
  }
}

// Eventos para el menú hamburguesa (VERSIÓN SEGURA)
if (btnMenu && fondoMenu && menuLateral) {
    btnMenu.addEventListener('click', alternarMenu);
    fondoMenu.addEventListener('click', alternarMenu);
}

// Lógica de los Acordeones 
cabecerasAcordeon.forEach(cabecera => {
  cabecera.addEventListener('click', function() {
    const acordeonPadre = this.parentElement;
    acordeonPadre.classList.toggle('abierto');
  });
});

// Lógica para arrastrar el carrusel con el Mouse en PC
const carruselesSwipe = document.querySelectorAll('.carrusel-swipe');
carruselesSwipe.forEach(carrusel => {
  let isDown = false;
  let startX;
  let scrollLeft;
  let pausaAuto = false;

  carrusel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carrusel.offsetLeft;
    scrollLeft = carrusel.scrollLeft;
    carrusel.style.scrollBehavior = 'auto';
    carrusel.style.scrollSnapType = 'none';
  });

  const soltarMouse = () => {
    if (!isDown) return;
    isDown = false;
    const anchoImagen = carrusel.clientWidth;
    const scrollActual = carrusel.scrollLeft;
    const imagenCercana = Math.round(scrollActual / anchoImagen);
    
    carrusel.style.scrollBehavior = 'smooth';
    carrusel.scrollLeft = imagenCercana * anchoImagen;
    
    setTimeout(() => {
      carrusel.style.scrollSnapType = 'x mandatory';
      carrusel.style.scrollBehavior = '';
    }, 300);
  };

  carrusel.addEventListener('mouseleave', soltarMouse);
  carrusel.addEventListener('mouseup', soltarMouse);

  carrusel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carrusel.offsetLeft;
    const walk = (x - startX); 
    carrusel.scrollLeft = scrollLeft - walk;
  });

  carrusel.addEventListener('pointerdown', () => {
    pausaAuto = true;
  });

  carrusel.addEventListener('pointerup', () => {
    pausaAuto = false;
  });

  carrusel.addEventListener('pointercancel', () => {
    pausaAuto = false;
  });

  setInterval(() => {
    if (pausaAuto || carrusel.scrollWidth <= carrusel.clientWidth) return;

    const anchoImagen = carrusel.clientWidth;
    const siguiente = carrusel.scrollLeft + anchoImagen;
    carrusel.scrollTo({
      left: siguiente >= carrusel.scrollWidth - 2 ? 0 : siguiente,
      behavior: 'smooth'
    });
  }, 4000);
});

// --- EL CANDADO DE SEGURIDAD PARA LOS BOTONES ---
// Función genérica para carruseles
function configurarCarrusel(idCarrusel, idBtnIzq, idBtnDer) {
  const carrusel = document.getElementById(idCarrusel);
  const btnIzq = document.getElementById(idBtnIzq);
  const btnDer = document.getElementById(idBtnDer);

  // LA MAGIA: Si no encuentra el carrusel o los botones en esta página, aborta la función y NO DA ERROR.
  if (!carrusel || !btnIzq || !btnDer) return;

  const desplazamiento = 150; // Un poco más suave el deslizamiento

  btnIzq.addEventListener("click", () => {
    carrusel.scrollBy({ left: -desplazamiento, behavior: "smooth" });
  });

  btnDer.addEventListener("click", () => {
    carrusel.scrollBy({ left: desplazamiento, behavior: "smooth" });
  });
}

// Configurar carrusel de servicios (Funcionará solo en el Inicio)
configurarCarrusel("carrusel-servicios", "btn-izq-servicios", "btn-der-servicios");

// Configurar carrusel de filtros (Funcionará solo en Negocios)
configurarCarrusel("carrusel-filtros", "btn-izq-filtros", "btn-der-filtros");

// Carrusel automático del inicio y control táctil para todos los carruseles.
const carruselesInicio = document.querySelectorAll('.carrusel-inicio');
carruselesInicio.forEach(carrusel => {
  let pausaAuto = false;

  carrusel.addEventListener('pointerdown', () => {
    pausaAuto = true;
  });

  carrusel.addEventListener('pointerup', () => {
    pausaAuto = false;
  });

  carrusel.addEventListener('pointercancel', () => {
    pausaAuto = false;
  });

  setInterval(() => {
    if (pausaAuto) return;

    const anchoImagen = carrusel.clientWidth;
    const maxScroll = carrusel.scrollWidth - anchoImagen;
    const siguiente = carrusel.scrollLeft + anchoImagen;

    carrusel.scrollTo({
      left: siguiente >= maxScroll - 2 ? 0 : siguiente,
      behavior: 'smooth'
    });
  }, 3500);
});

// Carruseles individuales (Habitaciones)
document.addEventListener('DOMContentLoaded', () => {
  const carruselesContenedores = document.querySelectorAll('.carrusel-contenedor');

  carruselesContenedores.forEach(contenedor => {
    const slide = contenedor.querySelector('.carrusel-slide');
    const btnAnt = contenedor.querySelector('.ant');
    const btnSig = contenedor.querySelector('.sig');
    
    // Solo aplica si encontró todo en la tarjeta
    if (slide && btnAnt && btnSig) {
        const imagenes = slide.querySelectorAll('img');
        let indiceActual = 0;

        if (imagenes.length > 0) {
          let inicioToque = 0;
          let pausaAuto = false;

          function actualizarCarrusel() {
            slide.style.transform = `translateX(-${indiceActual * 100}%)`;
          }

          function avanzarCarrusel() {
            indiceActual = (indiceActual + 1) % imagenes.length;
            actualizarCarrusel();
          }

          btnSig.addEventListener('click', () => {
            avanzarCarrusel();
          });

          btnAnt.addEventListener('click', () => {
            indiceActual--;
            if (indiceActual < 0) {
              indiceActual = imagenes.length - 1;
            }
            actualizarCarrusel();
          });

          contenedor.addEventListener('touchstart', evento => {
            inicioToque = evento.touches[0].clientX;
            pausaAuto = true;
          }, { passive: true });

          contenedor.addEventListener('touchend', evento => {
            const diferencia = evento.changedTouches[0].clientX - inicioToque;

            if (Math.abs(diferencia) > 40) {
              if (diferencia < 0) {
                avanzarCarrusel();
              } else {
                indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
                actualizarCarrusel();
              }
            }

            pausaAuto = false;
          }, { passive: true });

          contenedor.addEventListener('touchcancel', () => {
            pausaAuto = false;
          }, { passive: true });

          setInterval(() => {
            if (!pausaAuto) avanzarCarrusel();
          }, 4000);
        }
    }
  });
});

// --- LÓGICA DE FILTROS (Solo para negocios.html) ---
document.addEventListener("DOMContentLoaded", () => {
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const tarjetas = document.querySelectorAll(".tarjeta-hibrida");

    // EL CANDADO: Si hay botones de filtro en esta página, entonces activa la lógica
    if (botonesFiltro.length > 0) {
    function aplicarFiltro(filtroActivo) {
      tarjetas.forEach(tarjeta => {
        const catTarjeta = tarjeta.getAttribute("data-cat");
        const visible = filtroActivo === "todos" || catTarjeta === filtroActivo;
        tarjeta.hidden = !visible;
        tarjeta.classList.toggle("filtro-oculto", !visible);
      });
    }

        botonesFiltro.forEach(boton => {
            boton.addEventListener("click", () => {
                // Quitar activo a todos y poner al presionado
                botonesFiltro.forEach(b => b.classList.remove("active"));
                boton.classList.add("active");

                const filtroActivo = boton.getAttribute("data-categoria");
                aplicarFiltro(filtroActivo);
            });
        });

            aplicarFiltro(document.querySelector(".btn-filtro.active")?.getAttribute("data-categoria") || "todos");
    }
});

// Funcionalidad del Botón Volver Arriba
const btnVolverArriba = document.getElementById('btnVolverArriba');

if (btnVolverArriba) {
  // Mostrar u ocultar el botón según el scroll (se activa al bajar 300px)
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('visible');
    } else {
      btnVolverArriba.classList.remove('visible');
    }
  });

  // Evento para regresar suavemente al inicio
  btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Lógica para el botón flotante de subir
const btnSubir = document.getElementById("btn-subir");

if (btnSubir) {
    // Mostrar u ocultar el botón según el scroll
    window.addEventListener("scroll", () => {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            btnSubir.style.display = "block";
        } else {
            btnSubir.style.display = "none";
        }
    });

    // Subir suavemente al hacer clic
    btnSubir.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
