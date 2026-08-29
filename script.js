/*
==================================================
XTREME PREDICTOR 2.0
SCRIPT PRINCIPAL
SOPORTE MULTILOTERÍA
VERSIÓN ESTABLE
==================================================
*/


/*
==================================================
EMOJIS
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
OBTENER LISTAS DE ANIMALES DE FORMA SEGURA
==================================================
*/

function obtenerListaAnimales(
  nombre
) {

  if (
    nombre ===
    "guacharoactivo"
  ) {

    return (
      typeof animalesGuacharo !== "undefined"
        ? animalesGuacharo
        : []
    );

  }


  if (
    nombre ===
    "lagranjita"
  ) {

    return (
      typeof animalesGranjita !== "undefined"
        ? animalesGranjita
        : []
    );

  }


  if (
    nombre ===
    "selvaplus"
  ) {

    if (
      typeof animalesSelvaPlus !==
        "undefined"
    ) {

      return animalesSelvaPlus;

    }


    if (
      typeof animalesGranjita !==
        "undefined"
    ) {

      return animalesGranjita;

    }


    return [];

  }


  return [];

}


/*
==================================================
ANIMALES ACTUALES
==================================================
*/

let animales =
  obtenerListaAnimales(
    loteriaActual
  );


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
      "/api/analizar"

  },


  lagranjita: {

    nombre:
      "La Granjita",

    actualizar:
      "/api/actualizarGranjita",

    analizar:
      "/api/analizarGranjita"

  },


  selvaplus: {

    nombre:
      "Selva Plus",

    actualizar:
      "/api/actualizarSelvaPlus",

    analizar:
      "/api/analizarSelvaPlus"

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
ACTUALIZAR ANIMALES
==================================================
*/

function actualizarListaAnimales() {

  const lista =
    obtenerListaAnimales(
      loteriaActual
    );


  if (
    Array.isArray(lista) &&
    lista.length > 0
  ) {

    animales =
      lista;

  }

}


/*
==================================================
MENSAJE DE PRONÓSTICO
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


  if (
    !contenedor
  ) {

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


  if (
    !texto
  ) {

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
  tiempoMaximo = 15000
) {

  const controlador =
    new AbortController();


  const temporizador =
    setTimeout(
      () => {

        controlador.abort();

      },
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

  catch (
    error
  ) {

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
BUSCAR UN RESULTADO
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
        resultados.length > 0
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


      const mismoNombre =
        normalizarTexto(
          nombreAPI
        ) ===
        nombreBuscado;


      if (
        mismoNombre
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
MOSTRAR RESULTADOS DE HOY
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


  if (
    !contenedor
  ) {

    return;

  }


  const lista =
    [];


  if (
    resultadosHoy &&
    typeof resultadosHoy ===
      "object"
  ) {

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

  }


  lista.sort(
    (
      a,
      b
    ) =>
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


  const mapaPronosticos =
    obtenerMapaPronosticos(
      pronosticos
    );


  contenedor.innerHTML = `

    <div class="resultados-hoy-lista">

      ${lista.map(
        (
          resultado,
          index
        ) => {

          const esAcierto =
            Boolean(
              buscarPronosticoParaResultado(
                resultado,
                mapaPronosticos
              )
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
                  ? `
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
PINTAR PRONÓSTICOS
==================================================
*/

function pintarPronosticos(
  datos,
  configuracion
) {

  const contenedor =
    document.getElementById(
      "pronostico"
    );


  if (
    !contenedor
  ) {

    return;

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


  if (
    pronosticos.length ===
      0
  ) {

    mostrarMensajePronostico(
      "⚠️ Sin pronóstico disponible",
      "No hay suficientes datos para generar las posibilidades del día."
    );

    return;

  }


  contenedor.innerHTML = `

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


/*
==================================================
PINTAR TOP 10
==================================================
*/

function pintarTop10(
  datos
) {

  const tablaTop =
    document.getElementById(
      "top10"
    );


  if (
    !tablaTop
  ) {

    return;

  }


  tablaTop.innerHTML =
    "";


  if (
    !Array.isArray(
      datos.top10
    )
  ) {

    return;

  }


  datos.top10.forEach(
    (
      animal,
      index
    ) => {

      tablaTop.innerHTML += `

        <tr>

          <td>

            ${index + 1}

          </td>


          <td>

            <strong>

              ${obtenerEmoji(
                animal.animal
              )}

              ${animal.animal}

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
PINTAR ATRASADOS
==================================================
*/

function pintarAtrasados(
  datos
) {

  const tablaAtrasados =
    document.getElementById(
      "atrasados"
    );


  if (
    !tablaAtrasados
  ) {

    return;

  }


  tablaAtrasados.innerHTML =
    "";


  if (
    Array.isArray(
      datos.atrasados
    ) &&
    datos.atrasados.length > 0
  ) {

    datos.atrasados.forEach(
      (
        animal,
        index
      ) => {

        tablaAtrasados.innerHTML += `

          <tr>

            <td>

              ${index + 1}

            </td>


            <td>

              <strong>

                ${obtenerEmoji(
                  animal.animal
                )}

                ${animal.animal}

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

  else {

    tablaAtrasados.innerHTML = `

      <tr>

        <td colspan="5">

          No hay animales con
          7 o más días de atraso.

        </td>

      </tr>

    `;

  }

}


/*
==================================================
PINTAR ANIMALITOS
==================================================
*/

function pintarAnimales(
  datos
) {

  const contenedor =
    document.getElementById(
      "animales"
    );


  if (
    !contenedor
  ) {

    return;

  }


  contenedor.innerHTML =
    "";


  if (
    !Array.isArray(animales)
  ) {

    return;

  }


  animales.forEach(
    a => {

      const dato =
        Array.isArray(
          datos.top10
        )

          ?

          datos.top10.find(
            x =>
              normalizarTexto(
                x.animal
              ) ===
              normalizarTexto(
                a.animal
              )
          )

          :

          null;


      const resultadosAnimal =
        buscarResultadosAnimal(
          a,
          datos.resultadosHoy
        );


      let clase =
        "frio";


      if (
        dato
      ) {

        if (
          Number(
            dato.indice
          ) >= 80
        ) {

          clase =
            "caliente";

        }

        else if (
          Number(
            dato.indice
          ) >= 50
        ) {

          clase =
            "medio";

        }

      }


      let resultadoHoyHTML = `

        <small>

          ⏳ No salió hoy

        </small>

      `;


      if (
        resultadosAnimal.length > 0
      ) {

        resultadoHoyHTML = `

          <small>

            ✅ Salió hoy

            ${resultadosAnimal.map(
              resultado =>
                `

                  <br>

                  🕐 ${
                    resultado.hora ??
                    ""
                  }

                `
            ).join("")}

          </small>

        `;

      }


      contenedor.innerHTML += `

        <div class="animal ${clase}">

          <strong>

            ${a.numero}

          </strong>

          <br>

          ${obtenerEmoji(
            a.animal
          )}

          ${a.animal}

          <br>

          ${resultadoHoyHTML}

        </div>

      `;

    }
  );

}


/*
==================================================
PINTAR ESTADÍSTICAS
==================================================
*/

function pintarEstadisticas(
  datos,
  configuracion
) {

  const estadistica =
    document.getElementById(
      "estadistica"
    );


  if (
    !estadistica
  ) {

    return;

  }


  const estadisticasAPI =
    datos.estadisticas ||
    {};


  const totalHistorial =
    Number(
      datos.historial
    ) ||
    0;


  const totalAnimales =
    Number(
      estadisticasAPI.totalAnimales
    ) ||

    animales.length;


  const totalAtrasados =
    Number(
      estadisticasAPI.totalAtrasados
    ) ||
    0;


  const mayorAtrasoAnimal =
    estadisticasAPI.mayorAtraso ||

    (
      datos.atrasados &&
      datos.atrasados.length > 0

        ?

        datos.atrasados[0].animal

        :

        "N/A"
    );


  const diasMayorAtraso =
    Number(
      estadisticasAPI.diasMayorAtraso
    ) ||
    0;


  const candidatosPronostico =
    Number(
      estadisticasAPI.candidatosPronostico
    ) ||
    0;


  const pronosticosHoy =
    Number(
      estadisticasAPI.pronosticosHoy
    ) ||

    (
      Array.isArray(
        datos.pronosticos
      )

        ?

        datos.pronosticos.length

        :

        0
    );


  const pronosticoActual =
    estadisticasAPI.pronosticoActual ||

    (
      Array.isArray(
        datos.pronosticos
      ) &&
      datos.pronosticos.length > 0

        ?

        datos.pronosticos
          .map(
            a =>
              a.animal
          )
          .join(
            " • "
          )

        :

        "N/A"
