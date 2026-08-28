/*
==================================================
XTREME PREDICTOR 2.0
SCRIPT PRINCIPAL
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
NORMALIZAR TEXTO
==================================================
*/

function normalizarTexto(valor) {

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

function normalizarNumero(valor) {

  const texto =
    String(
      valor ?? ""
    )
      .trim();

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
OBTENER EMOJI
==================================================
*/

function obtenerEmoji(animal) {

  const clave =
    String(
      animal ?? ""
    )
      .trim()
      .toUpperCase();

  return (
    emojisAnimales[
      clave
    ] || "🐾"
  );

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
    typeof resultadosHoy !== "object"
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


  /*
  ----------------------------------------------
  BUSCAR POR NOMBRE
  ----------------------------------------------
  */

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


  /*
  ----------------------------------------------
  BUSCAR POR NÚMERO
  ----------------------------------------------
  */

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

        const numeroResultado =
          normalizarNumero(
            resultado?.numero
          );


        if (
          numeroResultado &&
          numeroResultado ===
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
BUSCAR TODOS LOS RESULTADOS DE UN ANIMAL
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
    normalizarTexto(
      animal.animal
    );


  const numeroBuscado =
    normalizarNumero(
      animal.numero
    );


  /*
  ----------------------------------------------
  BUSCAR POR NOMBRE
  ----------------------------------------------
  */

  Object.entries(
    resultadosHoy
  ).forEach(
    ([nombreAPI, resultados]) => {

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


  /*
  ----------------------------------------------
  BUSCAR POR NÚMERO
  ----------------------------------------------
  */

  if (
    numeroBuscado &&
    encontrados.length === 0
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

            const numeroResultado =
              normalizarNumero(
                resultado?.numero
              );


            if (
              numeroResultado &&
              numeroResultado ===
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
OBTENER NOMBRES DE LOS PRONÓSTICOS
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
BUSCAR PRONÓSTICO PARA UN RESULTADO
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


  /*
  ----------------------------------------------
  PRIMERO POR NOMBRE
  ----------------------------------------------
  */

  const porNombre =
    mapaPronosticos.get(
      nombre
    );


  if (
    porNombre
  ) {

    return porNombre;

  }


  /*
  ----------------------------------------------
  DESPUÉS POR NÚMERO
  ----------------------------------------------
  */

  const numero =
    normalizarNumero(
      resultado.numero
    );


  if (
    numero
  ) {

    return mapaPronosticos.get(
      `NUMERO:${numero}`
    ) || null;

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


  if (!contenedor) {
    return;
  }


  if (
    !resultadosHoy ||
    typeof resultadosHoy !== "object"
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


  const lista = [];


  Object.entries(
    resultadosHoy
  ).forEach(
    ([animal, resultados]) => {

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


  /*
  ----------------------------------------------
  ORDEN CRONOLÓGICO
  ----------------------------------------------
  */

  lista.sort(
    (a, b) => {

      return String(
        a.fecha
      ).localeCompare(
        String(
          b.fecha
        )
      );

    }
  );


  if (
    lista.length === 0
  ) {

    contenedor.innerHTML = `

      <p>
        ⏳ Todavía no hay resultados de hoy.
      </p>

    `;

    return;

  }


  /*
  ----------------------------------------------
  MOSTRAR
  ----------------------------------------------
  */

  contenedor.innerHTML = `

    <div class="resultados-hoy-lista">

      ${lista.map(
        (resultado, index) => {

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

  try {

    const respuesta =
      await fetch(

        "/api/analizar?_=" +
        Date.now(),

        {

          cache:
            "no-store",

          headers: {

            "Cache-Control":
              "no-cache, no-store, must-revalidate"

          }

        }

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
        "Error en el análisis"

      );

    }


    /*
    ==============================================
    PRONÓSTICOS
    ==============================================
    */

    const pronosticos =

      Array.isArray(
        datos.pronosticos
      )

        ?

        datos.pronosticos.slice(
          0,
          3
        )

        :

        [];


    /*
    ==============================================
    RESULTADOS DE HOY
    ==============================================
    */

    mostrarResultadosHoy(
      datos.resultadosHoy,
      pronosticos
    );


    /*
    ==============================================
    CONTENEDOR PRONÓSTICO
    ==============================================
    */

    const contenedorPronostico =
      document.getElementById(
        "pronostico"
      );


    /*
    ==============================================
    MOSTRAR PRONÓSTICOS
    ==============================================
    */

    if (
      pronosticos.length > 0 &&
      contenedorPronostico
    ) {

      contenedorPronostico.innerHTML = `

        <div class="pronosticos-dia">

          <h1>

            🎯 POSIBILIDADES DEL DÍA

          </h1>


          <p>

            Estos son los 3 animalitos que el análisis
            XTREME considera con mejores posibilidades
            según el historial actualizado.

          </p>


          <div class="lista-pronosticos">

            ${

              pronosticos.map(

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


                  const esAcierto =
                    Boolean(
                      resultado
                    );


                  const aciertosHTML =

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

                            #${resultado.numero ?? animal.numero}

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


                      ${aciertosHTML}


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

              ).join("")

            }

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

        "No hay suficientes datos para generar " +
        "las posibilidades del día."

      );

    }


    /*
    ==============================================
    TOP 10
    ==============================================
    */

    const tablaTop =
      document.getElementById(
        "top10"
      );


    if (tablaTop) {

      tablaTop.innerHTML = "";


      if (
        Array.isArray(
          datos.top10
        )
      ) {

        datos.top10.forEach(

          (animal, index) => {

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

    }


    /*
    ==============================================
    ANIMALES ATRASADOS
    ==============================================
    */

    const tablaAtrasados =
      document.getElementById(
        "atrasados"
      );


    if (tablaAtrasados) {

      tablaAtrasados.innerHTML = "";


      if (

        Array.isArray(
          datos.atrasados
        )

        &&

        datos.atrasados.length > 0

      ) {

        datos.atrasados.forEach(

          (animal, index) => {

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
    ==============================================
    ANIMALITOS
    ==============================================
    */

    const contenedorAnimales =
      document.getElementById(
        "animales"
      );


    if (
      contenedorAnimales &&
      Array.isArray(
        animales
      )
    ) {

      contenedorAnimales.innerHTML = "";


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
                  )

                  ===

                  normalizarTexto(
                    a.animal
                  )

              )

              :

              null;


          /*
          --------------------------------------
          RESULTADOS DE HOY
          --------------------------------------
          */

          const resultadosAnimal =
            buscarResultadosAnimal(
              a,
              datos.resultadosHoy
            );


          let clase =
            "frio";


          if (dato) {

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

                ${resultadosAnimal
                  .map(
                    resultado =>
                      `

                        <br>

                        🕐 ${resultado.hora ?? ""}

                      `
                  )
                  .join("")}

            </small>

            `;

          }


          contenedorAnimales.innerHTML += `

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
    ==============================================
    ESTADÍSTICAS
    ==============================================
    */

    const estadistica =
      document.getElementById(
        "estadistica"
      );


    if (estadistica) {

      const estadisticasAPI =
        datos.estadisticas ||
        {};


      const totalHistorial =
        Number(
          datos.historial
        ) || 0;


      const totalAnimales =
        Number(
          estadisticasAPI.totalAnimales
        )

        ||

        (
          Array.isArray(
            animales
          )

            ?

            animales.length

            :

            77

        );


      const totalAtrasados =
        Number(
          estadisticasAPI.totalAtrasados
        ) || 0;


      const mayorAtrasoAnimal =

        estadisticasAPI.mayorAtraso

        ||

        (
          datos.atrasados
          &&
          datos.atrasados.length > 0

            ?

            datos.atrasados[0].animal

            :

            "N/A"

        );


      const diasMayorAtraso =
        Number(
          estadisticasAPI.diasMayorAtraso
        ) || 0;


      const candidatosPronostico =
        Number(
          estadisticasAPI.candidatosPronostico
        ) || 0;


      const pronosticosHoy =

        Number(
          estadisticasAPI.pronosticosHoy
        )

        ||

        pronosticos.length;


      const pronosticoActual =

        estadisticasAPI.pronosticoActual

        ||

        (
          pronosticos.length > 0

            ?

            pronosticos
              .map(
                a =>
                  a.animal
              )
              .join(" • ")

            :

            "N/A"

        );


      estadistica.innerHTML = `

        <p>

          📚 Historial:

          <strong>

            ${totalHistorial}

          </strong>

          registros

        </p>


        <p>

          🐾 Animales analizados:

          <strong>

            ${totalAnimales}

          </strong>

        </p>


        <p>

          🎯 Posibilidades del día:

          <strong>

            ${pronosticosHoy}

          </strong>

          animalitos

        </p>


        <p>

          🔥 Pronósticos actuales:

          <strong>

            ${pronosticoActual}

          </strong>

        </p>


        <p>

          ⏳ Animales atrasados:

          <strong>

            ${totalAtrasados}

          </strong>

        </p>


        <p>

          📅 Mayor atraso:

          <strong>

            ${mayorAtrasoAnimal}

          </strong>

        </p>


        <p>

          📅 Días de atraso:

          <strong>

            ${diasMayorAtraso}

          </strong>

        </p>


        <p>

          🎯 Candidatos analizados:

          <strong>

            ${candidatosPronostico}

          </strong>

        </p>

      `;

    }

  }

  catch (error) {

    console.error(
      "ERROR EN CARGAR ANÁLISIS:",
      error
    );


    const pronostico =
      document.getElementById(
        "pronostico"
      );


    if (pronostico) {

      pronostico.innerHTML = `

        <h2>

          ❌ Error

        </h2>


        <p>

          ${error.message}

        </p>

      `;

    }


    const estadistica =
      document.getElementById(
        "estadistica"
      );


    if (estadistica) {

      estadistica.innerHTML = `

        ❌ Error al cargar estadísticas:

        <strong>

          ${error.message}

        </strong>

      `;

    }

  }

}


/*
==================================================
ACTUALIZAR TODO
==================================================
*/

async function actualizarTodo() {

  const boton =
    document.getElementById(
      "actualizar"
    );


  if (!boton) {
    return;
  }


  try {

    boton.disabled = true;


    boton.textContent =
      "⏳ ACTUALIZANDO RESULTADOS...";


    mostrarMensajePronostico(

      "🔄 Actualizando...",

      "Buscando resultados nuevos y " +
      "recalculando el análisis."

    );


    const respuestaActualizar =
      await fetch(

        "/api/actualizar?_=" +
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

        }

      );


    if (
      !respuestaActualizar.ok
    ) {

      throw new Error(

        `Error HTTP al actualizar: ${respuestaActualizar.status}`

      );

    }


    const datosActualizar =
      await respuestaActualizar.json();


    if (
      !datosActualizar.ok
    ) {

      throw new Error(

        datosActualizar.error ||

        "Error actualizando resultados"

      );

    }


    boton.textContent =
      "📊 RECALCULANDO...";


    await cargarAnalisis();


    boton.textContent =
      "✅ RESULTADOS ACTUALIZADOS";


    setTimeout(

      () => {

        boton.textContent =
          "🔄 ACTUALIZAR RESULTADOS";

      },

      2000

    );

  }

  catch (error) {

    console.error(

      "ERROR EN ACTUALIZAR TODO:",

      error

    );


    const pronostico =
      document.getElementById(
        "pronostico"
      );


    if (pronostico) {

      pronostico.innerHTML = `

        <h2>

          ❌ Error al actualizar

        </h2>


        <p>

          ${error.message}

        </p>

      `;

    }


    boton.textContent =
      "❌ ERROR — REINTENTAR";


    setTimeout(

      () => {

        boton.textContent =
          "🔄 ACTUALIZAR RESULTADOS";

      },

      2500

    );

  }

  finally {

    boton.disabled = false;

  }

}


/*
==================================================
BOTÓN ACTUALIZAR
==================================================
*/

const botonActualizar =
  document.getElementById(
    "actualizar"
  );


if (botonActualizar) {

  botonActualizar.addEventListener(

    "click",

    actualizarTodo

  );

}


/*
==================================================
CARGA INICIAL
==================================================
*/

cargarAnalisis();
