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
  localStorage.getItem(
    "xtremeLoteria"
  ) ||
  "guacharoactivo";


/*
==================================================
CONFIGURACIÓN DE LOTERÍAS
==================================================
*/

const configuracionLoterias = {

  guacharoactivo: {

    nombre:
      "Guácharo Activo",

    actualizar:
      "/api/actualizar",

    analizar:
      "/api/analizar",

    animales:
      animalesGuacharo

  },


  lagranjita: {

    nombre:
      "La Granjita",

    actualizar:
      "/api/actualizarGranjita",

    analizar:
      "/api/analizarGranjita",

    animales:
      animalesGranjita

  },


  selvaplus: {

    nombre:
      "Selva Plus",

    actualizar:
      "/api/actualizarSelvaPlus",

    analizar:
      "/api/analizarSelvaPlus",

    animales:
      animalesGuacharo

  }

};


/*
==================================================
OBTENER CONFIGURACIÓN
==================================================
*/

function obtenerConfiguracionLoteria() {

  return (
    configuracionLoterias[
      loteriaActual
    ] ||
    configuracionLoterias[
      "guacharoactivo"
    ]
  );

}


/*
==================================================
ACTUALIZAR ANIMALITOS SEGÚN LOTERÍA
==================================================
*/

function actualizarListaAnimales() {

  const configuracion =
    obtenerConfiguracionLoteria();


  if (
    Array.isArray(
      configuracion.animales
    )
  ) {

    animales =
      configuracion.animales;

  }

}


/*
==================================================
MENSAJE
==================================================
*/

function mostrarMensajePronostico(
  titulo,
  mensaje
) {

  const contenedor =
    document.getElementById(
      "pronostico"
    );


  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <div
      style="
        text-align:center;
        padding:25px 10px;
      "
    >

      <h2>
        ${titulo}
      </h2>

      <p>
        ${mensaje}
      </p>

    </div>

  `;

}


/*
==================================================
NORMALIZAR TEXTO
==================================================
*/

function normalizarTexto(
  valor
) {

  return String(
    valor ?? ""
  )
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    );

}


/*
==================================================
NORMALIZAR NÚMERO
==================================================
*/

function normalizarNumero(
  valor
) {

  const texto =
    String(
      valor ?? ""
    ).trim();


  if (!texto) {
    return "";
  }


  const numero =
    Number(
      texto
    );


  if (
    Number.isNaN(
      numero
    )
  ) {

    return texto;

  }


  return String(
    numero
  );

}


/*
==================================================
EMOJI
==================================================
*/

function obtenerEmoji(
  animal
) {

  const clave =
    String(
      animal ?? ""
    )
      .trim()
      .toUpperCase();


  return (
    emojisAnimales[
      clave
    ] ||
    emojisAnimales[
      normalizarTexto(
        clave
      )
    ] ||
    "🐾"
  );

}


/*
==================================================
FETCH SEGURO
==================================================
*/

async function fetchSeguro(
  url,
  opciones = {},
  tiempoMaximo = 30000
) {

  const controlador =
    new AbortController();


  const temporizador =
    setTimeout(
      () =>
        controlador.abort(),
      tiempoMaximo
    );


  try {

    return await fetch(
      url,
      {
        ...opciones,
        signal:
          controlador.signal
      }
    );

  }

  catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "El servidor tardó demasiado en responder."
      );

    }

    throw error;

  }

  finally {

    clearTimeout(
      temporizador
    );

  }

}


/*
==================================================
BUSCAR RESULTADO DE UN ANIMAL
==================================================
*/

function buscarResultadoAnimal(
  animal,
  resultadosHoy
) {

  if (
    !animal ||
    !resultadosHoy ||
    typeof resultadosHoy !==
      "object"
  ) {

    return null;

  }


  const nombreBuscado =
    normalizarTexto(
      animal.animal
    );


  const numeroBuscado =
    normalizarNumero(
      animal.numero
    );


  for (
    const [
      nombreAPI,
      resultados
    ]
    of Object.entries(
      resultadosHoy
    )
  ) {

    if (
      !Array.isArray(
        resultados
      )
    ) {

      continue;

    }


    if (
      normalizarTexto(
        nombreAPI
      ) ===
      nombreBuscado
