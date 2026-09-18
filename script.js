/*
==================================================
XTREME PREDICTOR 2.0
SCRIPT PRINCIPAL
SOPORTE MULTILOTERÍA
CABALLOS
VERSIÓN ESTABLE
==================================================
*/

const emojisAnimales = {
  "DELFÍN":"🐬","BALLENA":"🐋","CARNERO":"🐏","TORO":"🐂",
  "CIEMPIÉS":"🐛","ALACRÓN":"🦂","LEÓN":"🦁","RANA":"🐸",
  "PERICO":"🦜","RATÓN":"🐭","ÁGUILA":"🦅","TIGRE":"🐯",
  "GATO":"🐱","CABALLO":"🐴","MONO":"🐒","PALOMA":"🕊️",
  "ZORRO":"🦊","OSO":"🐻","PAVO":"🦃","BURRO":"🫏",
  "CHIVO":"🐐","COCHINO":"🐷","GALLO":"🐓","CAMELLO":"🐫",
  "CEBRA":"🦓","IGUANA":"🦎","GALLINA":"🐔","VACA":"🐄",
  "PERRO":"🐶","ZAMURO":"🦅","ELEFANTE":"🐘","CAIMÁN":"🐊",
  "LAPA":"🐹","ARDILLA":"🐿️","PESCADO":"🐟","VENADO":"🦌",
  "JIRAFA":"🦒","CULEBRA":"🐍","TORTUGA":"🐢","BÚFALO":"🐃",
  "LECHUZA":"🦉","AVISPA":"🐝","CANGURO":"🦘","TUCÁN":"🦜",
  "MARIPOSA":"🦋","CHIGÜIRE":"🦫","GARZA":"🪿","PUMA":"🐆",
  "PAVO REAL":"🦚","PUERCOESPÍN":"🦔","PEREZA":"🦥",
  "CANARIO":"🐤","PELÍCANO":"🦩","PULPO":"🐙","CARACOL":"🐌",
  "GRILLO":"🦗","OSO HORMIGUERO":"🐜","TIBURÓN":"🦈","PATO":"🦆",
  "HORMIGA":"🐜","PANTERA":"🐈‍⬛","CAMALEÓN":"🦎","PANDA":"🐼",
  "CACHICAMO":"🦔","CANGREJO":"🦀","GAVILÁN":"🦅","ARAÑA":"🕷️",
  "LOBO":"🐺","AVESTRUZ":"🪶","JAGUAR":"🐆","CONEJO":"🐰",
  "BISONTE":"🦬","GUACAMAYA":"🦜","GORILA":"🦍",
  "HIPOPÓTAMO":"🦛","TURPIAL":"🐦","GUÁCHARO":"🦉",
  "RINOCERONTE":"🦏","PINGÜINO":"🐧","ANTÍLOPE":"🦌",
  "CALAMAR":"🦑","MURCIÉLAGO":"🦇","CUERVO":"🐦‍⬛",
  "CUCARACHA":"🪳","BÚHO":"🦉","CAMARÓN":"🦐","HÁMSTER":"🐹",
  "BUEY":"🐂","CABRA":"🐐","ERIZO DE MAR":"🦔","ANGUILA":"🐍",
  "HURÓN":"🦦","MORROCOY":"🐢","CISNE":"🦢","GAVIOTA":"🪽",
  "PAUJIL":"🐦","ESCARABAJO":"🪲","CABALLITO DE MAR":"🐴",
  "LORO":"🦜","COCODRILO":"🐊","GUACHARITO":"🐤"
};

let loteriaActual =
  localStorage.getItem("xtremeLoteria") ||
  "guacharoactivo";

const configuracionLoterias = {
  guacharoactivo: {
    nombre: "Guácharo Activo",
    actualizar: "/api/actualizar",
    analizar: "/api/analizar"
  },

  lagranjita: {
    nombre: "La Granjita",
    actualizar: "/api/actualizarGranjita",
    analizar: "/api/analizarLoteria?loteria=lagranjita"
  },

  selvaplus: {
    nombre: "Selva Plus",
    actualizar: "/api/actualizarSelvaPlus",
    analizar: "/api/analizarLoteria?loteria=selvaplus"
  },

  guacharitomillonario: {
    nombre: "El Guacharito Millonario",
    actualizar: "/api/actualizarGuacharito",
    analizar: "/api/analizarLoteria?loteria=guacharitomillonario"
  },

  ruletaactiva: {
    nombre: "Ruleta Activa",
    actualizar: "/api/actualizarRuleta",
    analizar: "/api/analizarLoteria?loteria=ruletaactiva"
  },

  lottoactivo: {
    nombre: "Lotto Activo",
    actualizar: "/api/actualizarLotto",
    analizar: "/api/analizarLoteria?loteria=lottoactivo"
  },

  caballos: {
    nombre: "Caballos",
    actualizar: "/api/actualizarCaballos",
    analizar: "/api/analizarLoteria?loteria=caballos"
  },

  granamillonaria: {
    nombre: "Granja Millonaria",
    actualizar: "/api/actualizarGranjaMillonaria",
    analizar: "/api/analizarGranjaMillonaria"
  }
};

function obtenerListaAnimales(nombre) {
  if (nombre === "guacharoactivo" && typeof animalesGuacharo !== "undefined") return animalesGuacharo;
  if (nombre === "lagranjita" && typeof animalesGranjita !== "undefined") return animalesGranjita;
  if (nombre === "selvaplus" && typeof animalesSelvaPlus !== "undefined") return animalesSelvaPlus;
  if (nombre === "guacharitomillonario" && typeof animalesGuacharito !== "undefined") return animalesGuacharito;
  if (nombre === "ruletaactiva" && typeof animalesRuleta !== "undefined") return animalesRuleta;
  if (nombre === "lottoactivo" && typeof animalesLotto !== "undefined") return animalesLotto;

  if (
    nombre === "granamillonaria" &&
    typeof animalesGranjaMillonaria !== "undefined"
  ) {
    return animalesGranjaMillonaria;
  }

  if (nombre === "caballos") {
    if (
      typeof animalesCaballos !== "undefined" &&
      Array.isArray(animalesCaballos)
    ) {
      return animalesCaballos;
    }

    return [];
  }

  return [];
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizarNumero(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto) return "";

  const numero = Number(texto);

  if (Number.isNaN(numero)) return texto;

  return String(numero);
}

function formatearHoraResultado(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto) return "";

  if (!/^\d{4}-\d{2}-\d{2}T/.test(texto)) return texto;

  const fecha = new Date(texto);

  if (Number.isNaN(fecha.getTime())) return texto;

  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(fecha);
}

function obtenerEmoji(animal) {
  const nombre = String(animal ?? "").trim().toUpperCase();

  if (loteriaActual === "caballos") return "🐎";

  return (
    emojisAnimales[nombre] ||
    emojisAnimales[normalizarTexto(nombre)] ||
    "🐾"
  );
}

function obtenerConfiguracionLoteria() {
  return (
    configuracionLoterias[loteriaActual] ||
    configuracionLoterias.guacharoactivo
  );
}

function actualizarListaAnimales() {
  const lista = obtenerListaAnimales(loteriaActual);

  if (Array.isArray(lista) && lista.length > 0) {
    animales = lista;
  }
}

async function fetchSeguro(url, opciones = {}, tiempo = 20000) {
  const controlador = new AbortController();

  const temporizador = setTimeout(
    () => controlador.abort(),
    tiempo
  );

  try {
    return await fetch(url, {
      ...opciones,
      signal: controlador.signal,
      cache: "no-store"
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "El servidor tardó demasiado en responder."
      );
    }

    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

function buscarResultadosAnimal(animal, resultadosHoy) {
  const encontrados = [];

  if (!resultadosHoy) return encontrados;

  const nombreBuscado = normalizarTexto(
    animal.animal || animal.caballo
  );

  const numeroBuscado = normalizarNumero(animal.numero);

  if (
    typeof resultadosHoy === "object" &&
    !Array.isArray(resultadosHoy)
  ) {
    Object.entries(resultadosHoy).forEach(
      ([nombre, resultados]) => {
        if (!Array.isArray(resultados)) return;

        if (normalizarTexto(nombre) === nombreBuscado) {
          encontrados.push(...resultados);
        }
      }
    );
  }

  if (Array.isArray(resultadosHoy)) {
    resultadosHoy.forEach(resultado => {
      const nombreResultado = normalizarTexto(
        resultado?.animal || resultado?.caballo
      );

      const numeroResultado = normalizarNumero(
        resultado?.numero
      );

      if (nombreResultado === nombreBuscado) {
        encontrados.push(resultado);
        return;
      }

      if (
        numeroBuscado &&
        numeroResultado === numeroBuscado
      ) {
        encontrados.push(resultado);
      }
    });
  }

  if (
    encontrados.length === 0 &&
    numeroBuscado &&
    resultadosHoy &&
    typeof resultadosHoy === "object"
  ) {
    Object.values(resultadosHoy).forEach(resultados => {
      if (!Array.isArray(resultados)) return;

      resultados.forEach(resultado => {
        if (
          normalizarNumero(resultado?.numero) ===
          numeroBuscado
        ) {
          encontrados.push(resultado);
        }
      });
    });
  }

  return encontrados;
}

function buscarResultadoAnimal(animal, resultadosHoy) {
  const resultados = buscarResultadosAnimal(
    animal,
    resultadosHoy
  );

  return resultados.length > 0
    ? resultados[0]
    : null;
}

function obtenerMapaPronosticos(pronosticos) {
  const mapa = new Map();

  if (!Array.isArray(pronosticos)) return mapa;

  pronosticos.forEach(animal => {
    mapa.set(
      normalizarTexto(
        animal.animal || animal.caballo
      ),
      animal
    );

    mapa.set(
      `NUMERO:${normalizarNumero(animal.numero)}`,
      animal
    );
  });

  return mapa;
}

function buscarPronosticoParaResultado(resultado, mapa) {
  if (!resultado) return null;

  const nombre = normalizarTexto(
    resultado.animal || resultado.caballo
  );

  const porNombre = mapa.get(nombre);

  if (porNombre) return porNombre;

  const numero = normalizarNumero(resultado.numero);

  if (numero) {
    return mapa.get(`NUMERO:${numero}`) || null;
  }

  return null;
}

/*
==================================================
PÁGINA EXCLUSIVA DE CABALLOS
==================================================
*/

function mostrarPaginaCaballos() {
  const panelAnimalitos =
    document.getElementById("panelAnimalitos");

  const paginaCaballos =
    document.getElementById("caballosPage");

  if (!panelAnimalitos || !paginaCaballos) return;

  panelAnimalitos.style.display = "none";
  paginaCaballos.style.display = "block";

  cargarAnalisisCaballos();
}

function mostrarPanelAnimalitos() {
  const panelAnimalitos =
    document.getElementById("panelAnimalitos");

  const paginaCaballos =
    document.getElementById("caballosPage");

  if (paginaCaballos) {
    paginaCaballos.style.display = "none";
  }

  if (panelAnimalitos) {
    panelAnimalitos.style.display = "block";
  }

  cargarAnalisis();
}

function obtenerValorCaballo(caballo, campos) {
  if (!caballo) return "";

  for (const campo of campos) {
    if (
      caballo[campo] !== undefined &&
      caballo[campo] !== null &&
      caballo[campo] !== ""
    ) {
      return caballo[campo];
    }
  }

  return "";
}

/*
==================================================
TARJETA INDIVIDUAL DE CABALLO
==================================================
*/

function crearTarjetaCaballo(caballo, index) {
  const nombre =
    obtenerValorCaballo(caballo, [
      "caballo",
      "animal",
      "nombre",
      "horse"
    ]) ||
    `Caballo ${index + 1}`;

  const numero = obtenerValorCaballo(caballo, [
    "numero",
    "número",
    "number",
    "num"
  ]);

  const posicion = obtenerValorCaballo(caballo, [
    "posicion",
    "posición",
    "llegada",
    "puesto",
    "place"
  ]);

  const peso = obtenerValorCaballo(caballo, [
    "peso",
    "weight",
    "pesoJinete"
  ]);

  const jinete = obtenerValorCaballo(caballo, [
    "jinete",
    "jockey",
    "rider"
  ]);

  const entrenador = obtenerValorCaballo(caballo, [
    "entrenador",
    "trainer"
  ]);

  const distancia = obtenerValorCaballo(caballo, [
    "distancia",
    "distance"
  ]);

  const margen = obtenerValorCaballo(caballo, [
    "margen",
    "margin"
  ]);

  return `
    <div
      class="caballo-card"
      style="
        padding:16px;
        margin:10px 0;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.15);
      "
    >

      <h3>
        🐎 ${numero !== "" ? `#${numero} ` : ""}
        ${nombre}
      </h3>

      ${
        posicion !== ""
          ? `<p>🏁 Llegada: <strong>${posicion}</strong></p>`
          : ""
      }

      ${
        distancia !== ""
          ? `<p>📏 Distancia: <strong>${distancia} m</strong></p>`
          : ""
      }

      ${
        jinete !== ""
          ? `<p>🏇 Jinete: <strong>${jinete}</strong></p>`
          : ""
      }

      ${
        entrenador !== ""
          ? `<p>👨‍🏫 Entrenador: <strong>${entrenador}</strong></p>`
          : ""
      }

      ${
        peso !== ""
          ? `<p>⚖️ Peso: <strong>${peso}</strong></p>`
          : ""
      }

      ${
        margen !== ""
          ? `<p>📐 Margen: <strong>${margen}</strong></p>`
          : ""
      }

    </div>
  `;
}

/*
==================================================
CABALLOS DESTACADOS
NO MOSTRAR LISTA GLOBAL
==================================================
*/

function pintarCaballosDestacados(datos) {
  const contenedor =
    document.getElementById("caballosDestacados");

  if (!contenedor) return;

  /*
  La vista nueva trabaja por carrera.
  No mostramos un Top 10 global de caballos.
  */

  contenedor.innerHTML = "";
  contenedor.style.display = "none";
}

/*
==================================================
AGRUPAR CARRERAS
==================================================
*/

function pintarCarrerasCaballos(datos) {
  const contenedor =
    document.getElementById("carrerasCaballos");

  if (!contenedor) return;

  let filas =
    datos?.carreras ||
    datos?.carrerasHoy ||
    datos?.resultadosHoy ||
    [];

  if (!Array.isArray(filas)) {
    if (
      filas &&
      typeof filas === "object"
    ) {
      filas = Object.values(filas).flat();
    } else {
      filas = [];
    }
  }

  if (filas.length === 0) {
    contenedor.innerHTML = `
      <p>
        ⏳ Todavía no hay información de carreras.
      </p>
    `;
    return;
  }

  /*
  ==================================================
  AGRUPAR:
  HIPÓDROMO + FECHA + CARRERA
  ==================================================
  */

  const grupos = {};

  filas.forEach(item => {
    if (!item || typeof item !== "object") return;

    const hipodromo =
      obtenerValorCaballo(item, [
        "hipodromo",
        "hipódromo",
        "hipodromoNombre",
        "track",
        "pista"
      ]) ||
      "Hipódromo no identificado";

    const fecha =
      obtenerValorCaballo(item, [
        "fecha_carrera",
        "fechaCarrera",
        "fecha"
      ]) || "";

    const carrera =
      obtenerValorCaballo(item, [
        "carrera",
        "numeroCarrera",
        "numero_carrera",
        "race",
        "raceNumber"
      ]) || "?";

    const clave =
      `${normalizarTexto(hipodromo)}|${fecha}|${carrera}`;

    if (!grupos[clave]) {
      grupos[clave] = {
        hipodromo,
        fecha,
        carrera,
        caballos: []
      };
    }

    grupos[clave].caballos.push(item);
  });

  const gruposArray =
    Object.values(grupos);

  /*
  ==================================================
  ORDENAR HIPÓDROMO / FECHA / CARRERA
  ==================================================
  */

  gruposArray.sort((a, b) => {

    const hipodromo =
      String(a.hipodromo).localeCompare(
        String(b.hipodromo)
      );

    if (hipodromo !== 0) {
      return hipodromo;
    }

    const fechaA =
      String(a.fecha || "");

    const fechaB =
      String(b.fecha || "");

    if (fechaA !== fechaB) {
      return fechaB.localeCompare(fechaA);
    }

    return (
      Number(a.carrera) -
      Number(b.carrera)
    );
  });

  window.carrerasCaballosXTREME =
    gruposArray;

  /*
  ==================================================
  MOSTRAR SOLO LAS CARRERAS
  ==================================================
  */

  contenedor.innerHTML =
    gruposArray.map(
      (grupo, index) => {

        const fecha =
          grupo.fecha
            ? String(grupo.fecha)
                .split("T")[0]
            : "";

        return `
          <div
            class="carrera-caballos"
            onclick="mostrarCaballosCarrera(${index})"
            style="
              padding:16px;
              margin:10px 0;
              border-radius:14px;
              border:1px solid rgba(255,255,255,.15);
              cursor:pointer;
            "
          >

            <h3 style="margin:0 0 8px 0;">
              🏇 Carrera ${grupo.carrera}
            </h3>

            <p style="margin:5px 0;">
              🏟️
              <strong>
                ${grupo.hipodromo}
              </strong>
            </p>

            ${
              fecha
                ? `
                  <p style="margin:5px 0;">
                    📅
                    <strong>
                      ${fecha}
                    </strong>
                  </p>
                `
                : ""
            }

            <p style="margin:5px 0;">
              🐎
              <strong>
                ${grupo.caballos.length}
                caballos
              </strong>
            </p>

            <div
              style="
                margin-top:10px;
                font-weight:800;
              "
            >
              👉 VER CABALLOS
            </div>

          </div>
        `;
      }
    ).join("");
}

/*
==================================================
MOSTRAR CABALLOS DE UNA SOLA CARRERA
==================================================
*/

function mostrarCaballosCarrera(indice) {

  const carreras =
    window.carrerasCaballosXTREME || [];

  const grupo =
    carreras[indice];

  if (!grupo) return;

  const contenedor =
    document.getElementById("carrerasCaballos");

  if (!contenedor) return;

  const caballos =
    [...grupo.caballos].sort(
      (a, b) =>
        Number(
          a.posicion ??
          a["posición"] ??
          999
        ) -
        Number(
          b.posicion ??
          b["posición"] ??
          999
        )
    );

  const fecha =
    grupo.fecha
      ? String(grupo.fecha)
          .split("T")[0]
      : "";

  contenedor.innerHTML = `

    <div
      style="
        padding:16px;
        margin-bottom:15px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.15);
      "
    >

      <button
        onclick="volverListaCarrerasCaballos()"
        style="
          padding:10px 15px;
          border:0;
          border-radius:9px;
          cursor:pointer;
          margin-bottom:14px;
        "
      >
        ⬅️ VOLVER A CARRERAS
      </button>

      <h2 style="margin:5px 0;">
        🏇 Carrera ${grupo.carrera}
      </h2>

      <p>
        🏟️
        <strong>
          ${grupo.hipodromo}
        </strong>
      </p>

      ${
        fecha
          ? `
            <p>
              📅
              <strong>
                ${fecha}
              </strong>
            </p>
          `
          : ""
      }

      <p>
        🐎
        <strong>
          ${caballos.length}
          caballos
        </strong>
      </p>

    </div>

    <div>
      ${
        caballos.length > 0
          ? caballos.map(
              (caballo, i) =>
                crearTarjetaCaballo(
                  caballo,
                  i
                )
            ).join("")
          : `
            <p>
              ⏳ No hay caballos registrados
              para esta carrera.
            </p>
          `
      }
    </div>
  `;
}

/*
==================================================
VOLVER A LISTA DE CARRERAS
==================================================
*/

function volverListaCarrerasCaballos() {

  const carreras =
    window.carrerasCaballosXTREME || [];

  pintarCarrerasCaballos({
    carreras:
      carreras.flatMap(
        grupo => grupo.caballos
      )
  });
}

/*
==================================================
ESTADÍSTICAS DE CABALLOS
==================================================
*/

function pintarEstadisticasCaballos(datos) {
  const contenedor =
    document.getElementById("estadisticasCaballos");

  if (!contenedor) return;

  const estadisticas =
    datos.estadisticasCaballos ||
    datos.estadisticas ||
    {};

  const total =
    estadisticas.totalCaballos ??
    datos.totalCaballos ??
    0;

  const carreras =
    estadisticas.totalCarreras ??
    datos.totalCarreras ??
    (
      Array.isArray(datos.carreras)
        ? datos.carreras.length
        : 0
    );

  const historial =
    datos.historial ??
    estadisticas.historial ??
    0;

  const hipodromos =
    estadisticas.hipodromos ??
    datos.hipodromos ??
    "";

  const mejorCaballo =
    estadisticas.mejorCaballo ??
    estadisticas.caballoDestacado ??
    "";

  contenedor.innerHTML = `
    <div style="padding:10px;">

      <p>
        🐎 Total de caballos:
        <strong>${total}</strong>
      </p>

      <p>
        🏇 Carreras analizadas:
        <strong>${carreras}</strong>
      </p>

      <p>
        📚 Historial de carreras:
        <strong>${historial}</strong>
      </p>

      ${
        hipodromos
          ? `
            <p>
              🏟️ Hipódromos:
              <strong>
                ${
                  Array.isArray(hipodromos)
                    ? hipodromos.join(", ")
                    : hipodromos
                }
              </strong>
            </p>
          `
          : ""
      }

      ${
        mejorCaballo
          ? `
            <p>
              ⭐ Caballo destacado:
              <strong>
                ${mejorCaballo}
              </strong>
            </p>
          `
          : ""
      }

    </div>
  `;
}

/*
==================================================
PRONÓSTICO DE CABALLOS
NO MOSTRAR TOP GLOBAL
==================================================
*/

function pintarPronosticoCaballos(datos) {
  const contenedor =
    document.getElementById("pronosticoCaballos");

  if (!contenedor) return;

  /*
  El pronóstico global se elimina de la pantalla.
  El análisis debe quedar asociado a cada carrera.
  */

  contenedor.innerHTML = "";
  contenedor.style.display = "none";
}

/*
==================================================
CARGAR ANÁLISIS DE CABALLOS
==================================================
*/

async function cargarAnalisisCaballos() {

  const pronostico =
    document.getElementById("pronosticoCaballos");

  const carreras =
    document.getElementById("carrerasCaballos");

  const destacados =
    document.getElementById("caballosDestacados");

  const estadisticas =
    document.getElementById("estadisticasCaballos");

  const lista =
    document.getElementById("listaCaballos");

  if (pronostico) {
    pronostico.innerHTML = "";
    pronostico.style.display = "none";
  }

  if (carreras) {
    carreras.innerHTML =
      `<p>⏳ Cargando carreras...</p>`;
  }

  if (destacados) {
    destacados.innerHTML = "";
    destacados.style.display = "none";
  }

  if (estadisticas) {
    estadisticas.innerHTML =
      `<p>⏳ Calculando estadísticas...</p>`;
  }

  /*
  ==================================================
  ELIMINAR LA REGUERA DE 153 CABALLOS
  ==================================================
  */

  if (lista) {
    lista.innerHTML = "";
    lista.style.display = "none";
  }

  try {

    const configuracion =
      configuracionLoterias.caballos;

    const respuesta =
      await fetchSeguro(
        `${configuracion.analizar}&_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );

    if (!respuesta.ok) {
      throw new Error(
        `Error del servidor: ${respuesta.status}`
      );
    }

    const datos =
      await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.error ||
        "La API no pudo analizar Caballos."
      );
    }

    /*
    ================================================
    MOSTRAR SOLAMENTE:
    HIPÓDROMO → FECHA → CARRERA
    ================================================
    */

    pintarPronosticoCaballos(datos);

    pintarCarrerasCaballos(datos);

    pintarCaballosDestacados(datos);

    pintarEstadisticasCaballos(datos);

    /*
    ================================================
    ASEGURAR QUE LA LISTA ANTIGUA SIGA OCULTA
    ================================================
    */

    if (lista) {
      lista.innerHTML = "";
      lista.style.display = "none";
    }

  } catch (error) {

    console.error(
      "ERROR CABALLOS:",
      error
    );

    if (carreras) {
      carreras.innerHTML = `
        <div
          style="
            text-align:center;
            padding:20px;
          "
        >

          <h2>⚠️ ERROR EN CABALLOS</h2>

          <p>
            ${error.message}
          </p>

          <button
            onclick="cargarAnalisisCaballos()"
            style="
              margin-top:10px;
              padding:10px 18px;
              border:0;
              border-radius:8px;
              cursor:pointer;
            "
          >
            🔄 REINTENTAR
          </button>

        </div>
      `;
    }
  }
}

/*
==================================================
RESULTADOS DE HOY
SOLO ANIMALITOS
==================================================
*/

function mostrarResultadosHoy(
  resultadosHoy,
  pronosticos
) {
  const contenedor =
    document.getElementById("resultadosHoy");

  if (!contenedor) return;

  const lista = [];

  if (Array.isArray(resultadosHoy)) {

    resultadosHoy.forEach(resultado => {

      lista.push({
        animal:
          resultado?.animal ||
          resultado?.caballo ||
          "",
        numero:
          resultado?.numero ??
          "",
        hora:
          formatearHoraResultado(
            resultado?.hora ||
            resultado?.fecha
          ),
        fecha:
          resultado?.fecha ??
          ""
      });

    });

  } else if (
    resultadosHoy &&
    typeof resultadosHoy === "object"
  ) {

    Object.entries(resultadosHoy).forEach(
      ([animal, resultados]) => {

        if (!Array.isArray(resultados)) return;

        resultados.forEach(resultado => {

          lista.push({
            animal,
            numero:
              resultado?.numero ??
              "",
            hora:
              formatearHoraResultado(
                resultado?.hora ||
                resultado?.fecha
              ),
            fecha:
              resultado?.fecha ??
              ""
          });

        });

      }
    );
  }

  function obtenerOrdenResultado(resultado) {

    const fechaTexto =
      String(resultado?.fecha ?? "").trim();

    const fechaISO =
      new Date(fechaTexto).getTime();

    if (!Number.isNaN(fechaISO)) {
      return fechaISO;
    }

    return 0;
  }

  lista.sort(
    (a, b) =>
      obtenerOrdenResultado(a) -
      obtenerOrdenResultado(b)
  );

  if (lista.length === 0) {

    contenedor.innerHTML = `
      <p>
        ⏳ Todavía no hay resultados de hoy.
      </p>
    `;

    return;
  }

  const mapa =
    obtenerMapaPronosticos(pronosticos);

  contenedor.innerHTML = `
    <div class="resultados-hoy-lista">

      ${lista.map(
        (resultado, index) => {

          const acierto =
            buscarPronosticoParaResultado(
              resultado,
              mapa
            );

          const nombre =
            String(resultado.animal)
              .trim()
              .toUpperCase();

          return `
            <div class="resultado-hoy">

              <strong>
                ${index + 1}.
                ${obtenerEmoji(nombre)}
                ${nombre}
              </strong>

              <span>
                #${resultado.numero}
              </span>

              <small>
                🕐 ${resultado.hora || ""}
              </small>

              ${
                acierto
                  ? `
                    <div
                      class="acierto-resultado"
                      style="
                        margin-top:6px;
                        font-weight:900;
                      "
                    >
                      🚀💥🏁
                      ${nombre}
                      ACIERTO XTREME
                      🏁💥🚀
                    </div>
                  `
                  : ""
              }

            </div>
          `;
        }
      ).join("")}

    </div>
  `;
}

/*
==================================================
PRONÓSTICOS ANIMALITOS
==================================================
*/

function pintarPronosticos(
  datos,
  configuracion
) {
  const contenedor =
    document.getElementById("pronostico");

  if (!contenedor) return;

  const pronosticos =
    Array.isArray(datos.pronosticos)
      ? datos.pronosticos.slice(0, 3)
      : [];

  if (pronosticos.length === 0) {

    contenedor.innerHTML = `
      <div style="text-align:center;padding:25px 10px;">

        <h2>⚠️ Sin pronóstico disponible</h2>

        <p>
          No hay suficientes datos para generar
          las posibilidades del día.
        </p>

      </div>
    `;

    return;
  }

  contenedor.innerHTML = `
    <div class="pronosticos-dia">

      <h1>🎯 POSIBILIDADES DEL DÍA</h1>

      <p>
        ${configuracion.nombre}
        — análisis XTREME actualizado.
      </p>

      <div class="lista-pronosticos">

        ${pronosticos.map(
          (animal, index) => {

            const posicion =
              index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : "🥉";

            const resultado =
              buscarResultadoAnimal(
                animal,
                datos.resultadosHoy
              );

            const acierto =
              Boolean(resultado);

            const nombre =
              animal.animal ||
              animal.caballo ||
              "SIN NOMBRE";

            return `
              <div class="pronostico-animal">

                <h2>
                  ${posicion}
                  ${obtenerEmoji(nombre)}
                  ${nombre}
                </h2>

                ${
                  animal.numero !== null &&
                  animal.numero !== undefined &&
                  animal.numero !== ""
                    ? `
                      <p>
                        🔢 Número:
                        <strong>
                          #${animal.numero}
                        </strong>
                      </p>
                    `
                    : ""
                }

                ${
                  acierto
                    ? `
                      <div
                        class="acierto-xtreme"
                        style="
                          text-align:center;
                          font-weight:900;
                          margin:10px 0;
                        "
                      >
                        🚀💥🏁
                        ACIERTO XTREME
                        🏁💥🚀
                      </div>
                    `
                    : `
                      <div
                        class="estado-pronostico"
                        style="
                          font-weight:700;
                          margin:8px 0 10px;
                        "
                      >
                        🎯 Pronóstico activo
                      </div>
                    `
                }

                <p>
                  🔥 Confianza XTREME:
                  <strong>
                    ${animal.porcentaje ?? 0}%
                  </strong>
                </p>

                <p>
                  📊 Salidas:
                  <strong>
                    ${animal.salidas ?? 0}
                  </strong>
                </p>

                <p>
                  ⏳ Días sin salir:
                  <strong>
                    ${animal.diasSinSalir ?? 0}
                  </strong>
                </p>

                <p>
                  📈 Tendencia:
                  <strong>
                    ${animal.tendencia ?? "N/A"}
                  </strong>
                </p>

                <p>
                  🏷️ Categoría:
                  <strong>
                    ${animal.categoria ?? "N/A"}
                  </strong>
                </p>

              </div>
            `;
          }
        ).join("")}

      </div>

      <p class="nota-pronostico">
        👀 👉🏼 Son posibilidades estadísticas
        de XTREME.
      </p>

    </div>
  `;
}

/*
==================================================
TOP 10
==================================================
*/

function pintarTop10(datos) {
  const tabla =
    document.getElementById("top10");

  if (!tabla) return;

  tabla.innerHTML = "";

  if (!Array.isArray(datos.top10)) {
    return;
  }

  const listaTop10 =
    datos.top10.slice(0, 10);

  listaTop10.forEach(
    (animal, index) => {

      const nombre =
        animal.animal ||
        animal.caballo ||
        "SIN NOMBRE";

      tabla.innerHTML += `
        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            <strong>
              ${obtenerEmoji(nombre)}
              ${nombre}
            </strong>
          </td>

          <td>
            ${animal.salidas ?? 0}
          </td>

          <td>
            ${animal.diasSinSalir ?? 0}
          </td>

          <td>
            ${animal.indice ?? 0}%
          </td>

        </tr>
      `;
    }
  );
}

/*
==================================================
ATRASADOS
==================================================
*/

function pintarAtrasados(datos) {
  const tabla =
    document.getElementById("atrasados");

  if (!tabla) return;

  tabla.innerHTML = "";

  if (
    Array.isArray(datos.atrasados) &&
    datos.atrasados.length > 0
  ) {

    datos.atrasados.forEach(
      (animal, index) => {

        const nombre =
          animal.animal ||
          animal.caballo ||
          "SIN NOMBRE";

        tabla.innerHTML += `
          <tr>

            <td>
              ${index + 1}
            </td>

            <td>
              <strong>
                ${obtenerEmoji(nombre)}
                ${nombre}
              </strong>
            </td>

            <td>
              ${animal.salidas ?? 0}
            </td>

            <td>
              ${animal.diasSinSalir ?? 0}
            </td>

            <td>
              ${animal.indice ?? 0}%
            </td>

          </tr>
        `;
      }
    );

  } else {

    tabla.innerHTML = `
      <tr>
        <td colspan="5">
          No hay animales con 7 o más días de atraso.
        </td>
      </tr>
    `;
  }
}

/*
==================================================
ANIMALES
==================================================
*/

function pintarAnimales(datos) {
  const contenedor =
    document.getElementById("animales");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!Array.isArray(animales)) return;

  animales.forEach(animal => {

    const nombre =
      animal.animal ||
      animal.caballo ||
      "SIN NOMBRE";

    const dato =
      Array.isArray(datos.top10)
        ? datos.top10.find(
            x =>
              normalizarTexto(
                x.animal ||
                x.caballo
              ) ===
              normalizarTexto(nombre)
          )
        : null;

    const resultados =
      buscarResultadosAnimal(
        animal,
        datos.resultadosHoy
      );

    let clase = "frio";

    if (dato) {

      if (Number(dato.indice) >= 80) {
        clase = "caliente";
      } else if (Number(dato.indice) >= 50) {
        clase = "medio";
      }
    }

    let estado = `
      <small>
        ⏳ No salió hoy
      </small>
    `;

    if (resultados.length > 0) {

      estado = `
        <small>

          ✅ Salió hoy

          ${resultados.map(
            resultado => `
              <br>
              🕐
              ${formatearHoraResultado(
                resultado?.hora ||
                resultado?.fecha
              )}
            `
          ).join("")}

        </small>
      `;
    }

    contenedor.innerHTML += `
      <div class="animal ${clase}">

        <strong>
          ${
            animal.numero !== undefined &&
            animal.numero !== null &&
            animal.numero !== ""
              ? animal.numero
              : ""
          }
        </strong>

        <br>

        ${obtenerEmoji(nombre)}
        ${nombre}

        <br>

        ${estado}

      </div>
    `;
  });
}

/*
==================================================
ESTADÍSTICAS ANIMALITOS
==================================================
*/

function pintarEstadisticas(
  datos,
  configuracion
) {
  const contenedor =
    document.getElementById("estadistica");

  if (!contenedor) return;

  const estadisticas =
    datos.estadisticas ||
    {};

  const totalHistorial =
    Number(datos.historial) || 0;

  const totalAnimales =
    Number(estadisticas.totalAnimales) ||
    Number(datos.totalAnimales) ||
    (
      Array.isArray(animales)
        ? animales.length
        : 0
    );

  const totalAtrasados =
    Number(estadisticas.totalAtrasados) || 0;

  const mayorAtraso =
    estadisticas.mayorAtraso ||
    "N/A";

  const diasMayorAtraso =
    Number(estadisticas.diasMayorAtraso) || 0;

  const candidatos =
    Number(estadisticas.candidatosPronostico) ||
    Number(estadisticas.candidatos) ||
    0;

  const pronosticos =
    Array.isArray(datos.pronosticos)
      ? datos.pronosticos
      : [];

  contenedor.innerHTML = `
    <div class="estadisticas-grid">

      <p>
        🐾 Total de animalitos:
        <strong>${totalAnimales}</strong>
      </p>

      <p>
        📚 Historial:
        <strong>${totalHistorial}</strong>
      </p>

      <p>
        ⏳ Total atrasados:
        <strong>${totalAtrasados}</strong>
      </p>

      <p>
        🚨 Mayor atraso:
        <strong>${mayorAtraso}</strong>
      </p>

      <p>
        📅 Días de atraso:
        <strong>${diasMayorAtraso}</strong>
      </p>

      <p>
        🎯 Candidatos:
        <strong>${candidatos}</strong>
      </p>

      <p>
        🔥 Pronósticos de hoy:
        <strong>${pronosticos.length}</strong>
      </p>

      <p>
        🎰 Lotería:
        <strong>${configuracion.nombre}</strong>
      </p>

    </div>
  `;
}

/*
==================================================
CARGAR ANÁLISIS NORMAL
==================================================
*/

async function cargarAnalisis() {

  if (loteriaActual === "caballos") {
    mostrarPaginaCaballos();
    return;
  }

  const configuracion =
    obtenerConfiguracionLoteria();

  const pronostico =
    document.getElementById("pronostico");

  if (pronostico) {

    pronostico.innerHTML = `
      <h1>Analizando...</h1>

      <p>
        Calculando posibilidades XTREME...
      </p>
    `;
  }

  try {

    const respuesta =
      await fetchSeguro(
        `${configuracion.analizar}${
          configuracion.analizar.includes("?")
            ? "&"
            : "?"
        }_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );

    if (!respuesta.ok) {
      throw new Error(
        `Error del servidor: ${respuesta.status}`
      );
    }

    const datos =
      await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.error ||
        "La API no pudo analizar los resultados."
      );
    }

    actualizarListaAnimales();

    pintarPronosticos(
      datos,
      configuracion
    );

    mostrarResultadosHoy(
      datos.resultadosHoy,
      datos.pronosticos
    );

    pintarTop10(datos);

    pintarAtrasados(datos);

    pintarAnimales(datos);

    pintarEstadisticas(
      datos,
      configuracion
    );

  } catch (error) {

    console.error(
      "ERROR XTREME:",
      error
    );

    if (pronostico) {

      pronostico.innerHTML = `
        <div
          style="
            text-align:center;
            padding:20px;
          "
        >

          <h2>⚠️ ERROR XTREME</h2>

          <p>
            ${error.message}
          </p>

          <button
            onclick="cargarAnalisis()"
            style="
              margin-top:10px;
              padding:10px 18px;
              border:0;
              border-radius:8px;
              cursor:pointer;
            "
          >
            🔄 REINTENTAR
          </button>

        </div>
      `;
    }

    const estadistica =
      document.getElementById("estadistica");

    if (estadistica) {
      estadistica.innerHTML =
        `⚠️ No se pudo cargar el análisis.`;
    }
  }
}

/*
==================================================
ACTUALIZAR
==================================================
*/

async function actualizarTodo() {

  const boton =
    document.getElementById("actualizar");

  if (boton) {
    boton.disabled = true;
    boton.innerText =
      "⏳ ACTUALIZANDO...";
  }

  try {

    const configuracion =
      obtenerConfiguracionLoteria();

    const respuesta =
      await fetchSeguro(
        `${configuracion.actualizar}?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache"
          }
        },
        30000
      );

    if (!respuesta.ok) {
      throw new Error(
        `Error al actualizar: ${respuesta.status}`
      );
    }

    const datos =
      await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.error ||
        "No se pudieron actualizar los resultados."
      );
    }

    if (loteriaActual === "caballos") {
      await cargarAnalisisCaballos();
    } else {
      await cargarAnalisis();
    }

  } catch (error) {

    console.error(
      "ERROR ACTUALIZANDO:",
      error
    );

    alert(
      "⚠️ Error al actualizar:\n\n" +
      error.message
    );

  } finally {

    if (boton) {
      boton.disabled = false;
      boton.innerText =
        "🔄 ACTUALIZAR RESULTADOS";
    }
  }
}

/*
==================================================
CONTROLES
==================================================
*/

function inicializarControles() {

  const selector =
    document.getElementById("selectorLoteria");

  if (selector) {

    selector.value =
      loteriaActual;

    selector.addEventListener(
      "change",
      () => {

        loteriaActual =
          selector.value;

        localStorage.setItem(
          "xtremeLoteria",
          loteriaActual
        );

        if (loteriaActual === "caballos") {

          mostrarPaginaCaballos();

        } else {

          mostrarPanelAnimalitos();

          animales =
            obtenerListaAnimales(
              loteriaActual
            );
        }

      }
    );
  }

  const botonActualizar =
    document.getElementById("actualizar");

  if (botonActualizar) {

    botonActualizar.addEventListener(
      "click",
      actualizarTodo
    );
  }

  const volver =
    document.getElementById("volverLoterias");

  if (volver) {

    volver.addEventListener(
      "click",
      () => {

        loteriaActual =
          "guacharoactivo";

        localStorage.setItem(
          "xtremeLoteria",
          loteriaActual
        );

        if (selector) {
          selector.value =
            loteriaActual;
        }

        mostrarPanelAnimalitos();

        animales =
          obtenerListaAnimales(
            loteriaActual
          );

      }
    );
  }
}

/*
==================================================
INICIAR XTREME
==================================================
*/

function iniciarXTREME() {

  try {

    inicializarControles();

    if (loteriaActual === "caballos") {

      mostrarPaginaCaballos();

    } else {

      actualizarListaAnimales();

      cargarAnalisis();
    }

  } catch (error) {

    console.error(
      "ERROR AL INICIAR XTREME:",
      error
    );

    const pronostico =
      document.getElementById("pronostico");

    if (pronostico) {

      pronostico.innerHTML = `
        <div
          style="
            text-align:center;
            padding:20px;
          "
        >

          <h2>⚠️ ERROR XTREME</h2>

          <p>
            ${error.message}
          </p>

        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    iniciarXTREME
  );

} else {

  iniciarXTREME();
}
