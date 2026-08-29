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
      animalesSelvaPlus

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
    ) {

      if (
        resultados.length
      ) {

        return resultados[0];

      }

    }

  }


  if (
    numeroBuscado
  ) {

    for (
      const resultados
      of Object.values(
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


      for (
        const resultado
        of resultados
      ) {

        if (
          normalizarNumero(
            resultado?.numero
          ) ===
          numeroBuscado
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

  const encontrados =
    [];


  if (
    !animal ||
    !resultadosHoy ||
    typeof resultadosHoy !==
      "object"
  ) {

    return encontrados;

  }


  const nombreBuscado =
    normalizarTexto(
      animal.animal
    );


  const numeroBuscado =
    normalizarNumero(
      animal.numero
    );


  Object.entries(
    resultadosHoy
  ).forEach(
    ([
      nombreAPI,
      resultados
    ]) => {

      if (
        !Array.isArray(
          resultados
        )
      ) {

        return;

      }


      if (
        normalizarTexto(
          nombreAPI
        ) ===
        nombreBuscado
      ) {

        encontrados.push(
          ...resultados
        );

      }

    }
  );


  if (
    numeroBuscado &&
    encontrados.length ===
      0
  ) {

    Object.values(
      resultadosHoy
    ).forEach(
      resultados => {

        if (
          !Array.isArray(
            resultados
          )
        ) {

          return;

        }


        resultados.forEach(
          resultado => {

            if (
              normalizarNumero(
                resultado?.numero
              ) ===
              numeroBuscado
            ) {

              encontrados.push(
                resultado
              );

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

  const mapa =
    new Map();


  if (
    !Array.isArray(
      pronosticos
    )
  ) {

    return mapa;

  }


  pronosticos.forEach(
    animal => {

      mapa.set(
        normalizarTexto(
          animal.animal
        ),
        animal
      );


      mapa.set(
        `NUMERO:${normalizarNumero(
          animal.numero
        )}`,
        animal
      );

    }
  );


  return mapa;

}


/*
==================================================
BUSCAR PRONÓSTICO PARA RESULTADO
==================================================
*/

function buscarPronosticoParaResultado(
  resultado,
  mapaPronosticos
) {

  if (
    !resultado ||
    !mapaPronosticos
  ) {

    return null;

  }


  const nombre =
    normalizarTexto(
      resultado.animal
    );


  const porNombre =
    mapaPronosticos.get(
      nombre
    );


  if (
    porNombre
  ) {

    return porNombre;

  }


  const numero =
    normalizarNumero(
      resultado.numero
    );


  if (
    numero
  ) {

    return (
      mapaPronosticos.get(
        `NUMERO:${numero}`
      ) ||

      null
    );

  }


  return null;

}


/*
==================================================
RESULTADOS DE HOY
==================================================
*/

function mostrarResultadosHoy(
  resultadosHoy,
  pronosticos = []
) {

  const contenedor =
    document.getElementById(
      "resultadosHoy"
    );


  if (!contenedor) {
    return;
  }


  if (
    !resultadosHoy ||
    typeof resultadosHoy !==
      "object"
  ) {

    contenedor.innerHTML = `

      <p>
        ⏳ Todavía no hay resultados de hoy.
      </p>

    `;

    return;

  }


  const mapaPronosticos =
    obtenerMapaPronosticos(
      pronosticos
    );


  const lista =
    [];


  Object.entries(
    resultadosHoy
  ).forEach(
    ([
      animal,
      resultados
    ]) => {

      if (
        !Array.isArray(
          resultados
        )
      ) {

        return;

      }


      resultados.forEach(
        resultado => {

          lista.push({

            animal,

            numero:
              resultado?.numero ??
              "",

            hora:
              resultado?.hora ??
              "",

            fecha:
              resultado?.fecha ??
              ""

          });

        }
      );

    }
  );


  lista.sort(
    (a, b) =>
      String(
        a.fecha
      ).localeCompare(
        String(
          b.fecha
        )
      )
  );


  if (
    lista.length ===
      0
  ) {

    contenedor.innerHTML = `

      <p>
        ⏳ Todavía no hay resultados de hoy.
      </p>

    `;

    return;

  }


  contenedor.innerHTML = `

    <div class="resultados-hoy-lista">

      ${lista.map(
        (
          resultado,
          index
        ) => {

          const pronostico =
            buscarPronosticoParaResultado(
              resultado,
              mapaPronosticos
            );


          const esAcierto =
            Boolean(
              pronostico
            );


          const nombreMostrar =
            String(
              resultado.animal
            )
              .trim()
              .toUpperCase();


          return `

            <div
              class="resultado-hoy"
              ${
                esAcierto
                  ? `
                    style="
                      border-left:4px solid #22c55e;
                      padding-left:8px;
                    "
                  `
                  : ""
              }
            >

              <strong>

                ${index + 1}.

                ${obtenerEmoji(
                  resultado.animal
                )}

                ${nombreMostrar}

              </strong>


              <span>

                #${resultado.numero}

              </span>


              <small>

                🕐 ${resultado.hora}

              </small>


              ${
                esAcierto

                  ?

                  `

                    <div
                      class="acierto-resultado"
                      style="
                        margin-top:5px;
                        font-size:1.02em;
                        font-weight:900;
                        line-height:1.3;
                      "
                    >

                      🚀💥➡️ 🏁

                      ${nombreMostrar}

                      ACIERTO XTREME

                      🏁 ⬅️💥🚀

                    </div>

                  `

                  :

                  ""

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
CARGAR ANÁLISIS
==================================================
*/

async function cargarAnalisis() {

  const configuracion =
    obtenerConfiguracionLoteria();


  /*
  CAMBIAR LISTA DE ANIMALITOS
  */

  actualizarListaAnimales();


  try {

    mostrarMensajePronostico(
      "⏳ Analizando...",
      `Calculando posibilidades de ${configuracion.nombre}...`
    );


    const respuesta =
      await fetchSeguro(

        configuracion.analizar +
        "?_=" +
        Date.now(),

        {

          method:
            "GET",

          cache:
            "no-store",

          headers: {

            "Cache-Control":
              "no-cache, no-store, must-revalidate",

            "Pragma":
              "no-cache"

          }

        },

        30000

      );


    if (
      !respuesta.ok
    ) {

      throw new Error(
        `Error HTTP: ${respuesta.status}`
      );

    }


    const datos =
      await respuesta.json();


    if (
      !datos.ok
    ) {

      throw new Error(
        datos.error ||
        "Error en el análisis."
      );

    }


    const pronosticos =
      Array.isArray(
        datos.pronosticos
      )

        ? datos.pronosticos.slice(
            0,
            3
          )

        : [];


    /*
    RESULTADOS DE HOY
    */

    mostrarResultadosHoy(
      datos.resultadosHoy,
      pronosticos
    );


    /*
    PRONÓSTICOS
    */

    const contenedorPronostico =
      document.getElementById(
        "pronostico"
      );


    if (
      contenedorPronostico &&
      pronosticos.length > 0
    ) {

      contenedorPronostico.innerHTML = `

        <div class="pronosticos-dia">

          <h1>
            🎯 POSIBILIDADES DEL DÍA
          </h1>


          <p>

            ${configuracion.nombre}

            — análisis XTREME actualizado.

          </p>


          <div class="lista-pronosticos">

            ${pronosticos.map(

              (
                animal,
                index
              ) => {

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


                const esAcierto =
                  Boolean(
                    resultado
                  );


                const estado =

                  esAcierto

                    ?

                    `

                      <div
                        class="acierto-xtreme"
                        style="
                          text-align:center;
                          font-size:1.12em;
                          font-weight:900;
                          line-height:1.35;
                          margin:10px 0 12px;
                          padding:8px 5px;
                        "
                      >

                        🚀💥➡️ 🏁

                        ${animal.animal}

                        ACIERTO XTREME

                        🏁 ⬅️💥🚀

                      </div>


                      <p>

                        🎯 Resultado:

                        <strong>

                          #${
                            resultado.numero ??
                            animal.numero
                          }

                          ${
                            resultado.hora
                              ? " · " +
                                resultado.hora
                              : ""
                          }

                        </strong>

                      </p>

                    `

                    :

                    `

                      <div
                        class="estado-pronostico"
                        style="
                          font-weight:700;
                          margin:8px 0 10px;
                        "
                      >

                        🎯 Pronóstico activo

                      </div>

                    `;


                return `

                  <div class="pronostico-animal">

                    <h2>

                      ${posicion}

                      ${obtenerEmoji(
                        animal.animal
                      )}

                      ${animal.animal}

                    </h2>


                    ${estado}


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
            de XTREME proyecto.

          </p>

        </div>

      `;

    }

    else {

      mostrarMensajePronostico(
        "⚠️ Sin pronóstico disponible",
        "No hay suficientes datos para generar las posibilidades del día."
      );

    }


    /*
    TOP 10
    */

    const tablaTop =
      document.getElementById(
        "top10"
      );


   
