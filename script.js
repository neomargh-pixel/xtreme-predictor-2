/*
==================================================
XTREME PREDICTOR 2.0
SCRIPT PRINCIPAL
SOPORTE MULTILOTERÍA
==================================================
*/


/*
==================================================
EMOJIS DE LOS ANIMALITOS
==================================================
*/

const emojisAnimales = {

  "DELFÍN": "🐬",
  "BALLENA": "🐋",
  "CARNERO": "🐏",
  "TORO": "🐂",
  "CIEMPIÉS": "🐛",
  "ALACRÁN": "🦂",
  "LEÓN": "🦁",
  "RANA": "🐸",
  "PERICO": "🦜",
  "RATÓN": "🐭",
  "ÁGUILA": "🦅",

  "TIGRE": "🐯",
  "GATO": "🐱",
  "CABALLO": "🐴",
  "MONO": "🐒",
  "PALOMA": "🕊️",
  "ZORRO": "🦊",
  "OSO": "🐻",
  "PAVO": "🦃",
  "BURRO": "🫏",
  "CHIVO": "🐐",

  "COCHINO": "🐷",
  "GALLO": "🐓",
  "CAMELLO": "🐫",
  "CEBRA": "🦓",
  "IGUANA": "🦎",
  "GALLINA": "🐔",
  "VACA": "🐄",
  "PERRO": "🐶",
  "ZAMURO": "🦅",
  "ELEFANTE": "🐘",

  "CAIMÁN": "🐊",
  "LAPA": "🐹",
  "ARDILLA": "🐿️",
  "PESCADO": "🐟",
  "VENADO": "🦌",
  "JIRAFA": "🦒",
  "CULEBRA": "🐍",
  "TORTUGA": "🐢",
  "BÚFALO": "🐃",
  "LECHUZA": "🦉",

  "AVISPA": "🐝",
  "CANGURO": "🦘",
  "TUCÁN": "🦜",
  "MARIPOSA": "🦋",
  "CHIGÜIRE": "🦫",
  "GARZA": "🪿",
  "PUMA": "🐆",
  "PAVO REAL": "🦚",
  "PUERCOESPÍN": "🦔",
  "PEREZA": "🦥",

  "CANARIO": "🐤",
  "PELÍCANO": "🦩",
  "PULPO": "🐙",
  "CARACOL": "🐌",
  "GRILLO": "🦗",
  "OSO HORMIGUERO": "🐜",
  "TIBURÓN": "🦈",
  "PATO": "🦆",
  "HORMIGA": "🐜",
  "PANTERA": "🐈‍⬛",

  "CAMALEÓN": "🦎",
  "PANDA": "🐼",
  "CACHICAMO": "🦔",
  "CANGREJO": "🦀",
  "GAVILÁN": "🦅",
  "ARAÑA": "🕷️",
  "LOBO": "🐺",
  "AVESTRUZ": "🪶",
  "JAGUAR": "🐆",
  "CONEJO": "🐰",

  "BISONTE": "🦬",
  "GUACAMAYA": "🦜",
  "GORILA": "🦍",
  "HIPOPÓTAMO": "🦛",
  "TURPIAL": "🐦",
  "GUÁCHARO": "🦉"

};


/*
==================================================
LOTERÍA ACTUAL
==================================================
*/

let loteriaActual =
  localStorage.getItem("xtremeLoteria") ||
  "guacharoactivo";


/*
==================================================
CONFIGURACIÓN DE LOTERÍAS
==================================================
*/

const configuracionLoterias = {

  guacharoactivo: {

    nombre: "Guácharo Activo",

    actualizar: "/api/actualizar",

    analizar: "/api/analizar"

  },

  lagranjita: {

    nombre: "La Granjita",

    actualizar: "/api/actualizarGranjita",

    analizar: "/api/analizarGranjita"

  }

};


/*
==================================================
OBTENER CONFIGURACIÓN ACTUAL
==================================================
*/

function obtenerConfiguracionLoteria() {

  return (
    configuracionLoterias[loteriaActual] ||
    configuracionLoterias.guacharoactivo
  );

}


/*
==================================================
NORMALIZAR TEXTO
==================================================
*/

function normalizarTexto(valor) {

  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

}


/*
==================================================
NORMALIZAR NÚMERO
==================================================
*/

function normalizarNumero(valor) {

  const texto =
    String(valor ?? "").trim();

  if (!texto) {
    return "";
  }

  const numero =
    Number(texto);

  if (Number.isNaN(numero)) {
    return texto;
  }

  return String(numero);

}


/*
==================================================
OBTENER EMOJI
==================================================
*/

function obtenerEmoji(animal) {

  const clave =
    String(animal ?? "")
      .trim()
      .toUpperCase();

  return emojisAnimales[clave] || "🐾";

}


/*
==================================================
MOSTRAR MENSAJE DE PRONÓSTICO
==================================================
*/

function mostrarMensajePronostico(
  titulo,
  mensaje
) {

  const contenedor =
    document.getElementById("pronostico");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `

    <div class="pronosticos-dia">

      <h1>
        ${titulo}
      </h1>

      <p>
        ${mensaje}
      </p>

    </div>

  `;

}


/*
==================================================
BUSCAR RESULTADO DE ANIMAL
==================================================
*/

function buscarResultadoAnimal(
  animal,
  resultadosHoy
) {

  if (
    !animal ||
    !resultadosHoy ||
    typeof resultadosHoy !== "object"
  ) {
    return null;
  }

  const nombreBuscado =
    normalizarTexto(animal.animal);

  const numeroBuscado =
    normalizarNumero(animal.numero);


  /*
  ----------------------------------------------
  POR NOMBRE
  ----------------------------------------------
  */

  for (
    const [nombreAPI, resultados]
    of Object.entries(resultadosHoy)
  ) {

    if (!Array.isArray(resultados)) {
      continue;
    }

    if (
      normalizarTexto(nombreAPI) ===
      nombreBuscado
    ) {

      if (resultados.length > 0) {
        return resultados[0];
      }

    }

  }


  /*
  ----------------------------------------------
  POR NÚMERO
  ----------------------------------------------
  */

  if (numeroBuscado) {

    for (
      const resultados
      of Object.values(resultadosHoy)
    ) {

      if (!Array.isArray(resultados)) {
        continue;
      }

      for (
        const resultado
        of resultados
      ) {

        const numeroResultado =
          normalizarNumero(
            resultado?.numero
          );

        if (
          numeroResultado &&
          numeroResultado === numeroBuscado
        ) {

          return resultado;

        }

      }

    }

  }


  return null;

}


/*
==================================================
BUSCAR TODOS LOS RESULTADOS
==================================================
*/

function buscarResultadosAnimal(
  animal,
  resultadosHoy
) {

  const encontrados = [];


  if (
    !animal ||
    !resultadosHoy ||
    typeof resultadosHoy !== "object"
  ) {

    return encontrados;

  }


  const nombreBuscado =
    normalizarTexto(animal.animal);

  const numeroBuscado =
    normalizarNumero(animal.numero);


  /*
  ----------------------------------------------
  POR NOMBRE
  ----------------------------------------------
  */

  Object.entries(resultadosHoy).forEach(
    ([nombreAPI, resultados]) => {

      if (!Array.isArray(resultados)) {
        return;
      }

      if (
        normalizarTexto(nombreAPI) ===
        nombreBuscado
      ) {

        encontrados.push(...resultados);

      }

    }
  );


  /*
  ----------------------------------------------
  POR NÚMERO
  ----------------------------------------------
  */

  if (
    numeroBuscado &&
    encontrados.length === 0
  ) {

    Object.values(resultadosHoy).forEach(
      resultados => {

        if (!Array.isArray(resultados)) {
          return;
        }

        resultados.forEach(
          resultado => {

            const numeroResultado =
              normalizarNumero(
                resultado?.numero
              );

            if (
              numeroResultado &&
              numeroResultado === numeroBuscado
            ) {

              encontrados.push(resultado);

            }

          }
        );

      }
    );

  }


  return encontrados;

}


/*
==================================================
MAPA DE PRONÓSTICOS
==================================================
*/

function obtenerMapaPronosticos(
  pronosticos
) {

  const mapa = new Map();
