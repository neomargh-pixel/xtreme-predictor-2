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


/*
==================================================
LISTA DE ANIMALES
==================================================
*/

function obtenerListaAnimales(nombre) {

  if (
    nombre === "guacharoactivo" &&
    typeof animalesGuacharo !== "undefined"
  ) {
    return animalesGuacharo;
  }

  if (
    nombre === "lagranjita" &&
    typeof animalesGranjita !== "undefined"
  ) {
    return animalesGranjita;
  }

  if (
    nombre === "selvaplus" &&
    typeof animalesSelvaPlus !== "undefined"
  ) {
    return animalesSelvaPlus;
  }

  if (
    nombre === "guacharitomillonario" &&
    typeof animalesGuacharito !== "undefined"
  ) {
    return animalesGuacharito;
  }

  if (
    nombre === "ruletaactiva" &&
    typeof animalesRuleta !== "undefined"
  ) {
    return animalesRuleta;
  }

  if (
    nombre === "lottoactivo" &&
    typeof animalesLotto !== "undefined"
  ) {
    return animalesLotto;
  }

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
FORMATEAR HORA DE RESULTADO
==================================================

La API puede enviar:

2026-09-16T23:00:00+00:00

Eso está en UTC.

Venezuela = UTC-4.

Se convierte a:

7:00 p. m.

Si la API ya envía una hora normal,
se conserva tal cual.

==================================================
*/

function formatearHoraResultado(valor) {

  const texto =
    String(valor ?? "").trim();

  if (!texto) {
    return "";
  }


  /*
  ----------------------------------------------
  SI YA ES UNA HORA NORMAL
  ----------------------------------------------
  */

  if (
    !/^\d{4}-\d{2}-\d{2}T/.test(texto)
  ) {

    return texto;

  }


  /*
  ----------------------------------------------
  CONVERTIR ISO → HORA VENEZUELA
  ----------------------------------------------
  */

  const fecha =
    new Date(texto);


  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {

    return texto;

  }


  return new Intl.DateTimeFormat(
    "es-VE",
    {
      timeZone:
        "America/Caracas",

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true
    }
  ).format(fecha);

}


/*
==================================================
EMOJI
==================================================
*/

function obtenerEmoji(animal) {

  const nombre =
    String(animal ?? "")
      .trim()
      .toUpperCase();

  if (
    loteriaActual === "caballos"
  ) {
    return "🐎";
  }

  return (
    emojisAnimales[nombre] ||
    emojisAnimales[
      normalizarTexto(nombre)
    ] ||
    "🐾"
  );

}


/*
==================================================
CONFIGURACIÓN ACTUAL
==================================================
*/

function obtenerConfiguracionLoteria() {

  return (
    configuracionLoterias[
      loteriaActual
    ] ||
    configuracionLoterias
      .guacharoactivo
  );

}


/*
==================================================
ACTUALIZAR LISTA DE ANIMALES
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

    animales = lista;

  }

}


/*
==================================================
FETCH SEGURO
==================================================
*/

async function fetchSeguro(
  url,
  opciones = {},
  tiempo = 20000
) {

  const controlador =
    new AbortController();

  const temporizador =
    setTimeout(
      () => controlador.abort(),
      tiempo
    );

  try {

    const respuesta =
      await fetch(
        url,
        {
          ...opciones,
          signal:
            controlador.signal,
          cache: "no-store"
        }
      );

    return respuesta;

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "El servidor tardó demasiado en responder."
      );

    }

    throw error;

  } finally {

    clearTimeout(
      temporizador
    );

  }

}


/*
==================================================
BUSCAR RESULTADOS DE ANIMAL
==================================================
*/

function buscarResultadosAnimal(
  animal,
  resultadosHoy
) {

  const encontrados = [];

  if (!resultadosHoy) {
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

  if (
    typeof resultadosHoy ===
    "object" &&
    !Array.isArray(
      resultadosHoy
    )
  ) {

    Object.entries(
      resultadosHoy
    ).forEach(
      ([nombre, resultados]) => {

        if (
          !Array.isArray(
            resultados
          )
        ) {
          return;
        }

        if (
          normalizarTexto(
            nombre
          ) ===
          nombreBuscado
        ) {

          encontrados.push(
            ...resultados
          );

        }

      }
    );

  }

  if (
    Array.isArray(
      resultadosHoy
    )
  ) {

    resultadosHoy.forEach(
      resultado => {

        const nombreResultado =
          normalizarTexto(
            resultado?.animal ||
            resultado?.caballo
          );

        const numeroResultado =
          normalizarNumero(
            resultado?.numero
          );

        if (
          nombreResultado ===
          nombreBuscado
        ) {

          encontrados.push(
            resultado
          );

          return;
        }

        if (
          numeroBuscado &&
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

  if (
    encontrados.length === 0 &&
    numeroBuscado
  ) {

    if (
      resultadosHoy &&
      typeof resultadosHoy ===
      "object"
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

  }

  return encontrados;

}


/*
==================================================
BUSCAR RESULTADO
==================================================
*/

function buscarResultadoAnimal(
  animal,
  resultadosHoy
) {

  const resultados =
    buscarResultadosAnimal(
      animal,
      resultadosHoy
    );

  return resultados.length > 0
    ? resultados[0]
    : null;

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
          animal.animal ||
          animal.caballo
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
BUSCAR PRONÓSTICO
==================================================
*/

function buscarPronosticoParaResultado(
  resultado,
  mapa
) {

  if (!resultado) {
    return null;
  }

  const nombre =
    normalizarTexto(
      resultado.animal ||
      resultado.caballo
    );

  const porNombre =
    mapa.get(nombre);

  if (porNombre) {
    return porNombre;
  }

  const numero =
    normalizarNumero(
      resultado.numero
    );

  if (numero) {

    return (
      mapa.get(
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
  pronosticos
) {

  const contenedor =
    document.getElementById(
      "resultadosHoy"
    );

  if (!contenedor) {
    return;
  }

  const lista = [];


  /*
  ----------------------------------------------
  FORMATO ARRAY
  ----------------------------------------------
  */

  if (
    Array.isArray(
      resultadosHoy
    )
  ) {

    resultadosHoy.forEach(
      resultado => {

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

      }
    );

  }


  /*
  ----------------------------------------------
  FORMATO OBJETO
  ----------------------------------------------
  */

  else if (
    resultadosHoy &&
    typeof resultadosHoy ===
    "object"
  ) {

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
                formatearHoraResultado(
                  resultado?.hora ||
                  resultado?.fecha
                ),

              fecha:
                resultado?.fecha ??
                ""

            });

          }
        );

      }
    );

  }


  /*
  ==================================================
  ORDENAR RESULTADOS
  ==================================================
  */

  function obtenerOrdenResultado(
    resultado
  ) {

    const fechaTexto =
      String(
        resultado?.fecha ?? ""
      ).trim();


    /*
    ----------------------------------------------
    SI FECHA ES ISO
    ----------------------------------------------
    */

    const fechaISO =
      new Date(
        fechaTexto
      ).getTime();


    if (
      !Number.isNaN(
        fechaISO
      )
    ) {

      return fechaISO;

    }


    /*
    ----------------------------------------------
    FECHA + HORA NORMAL
    ----------------------------------------------
    */

    const coincidenciaFecha =
      fechaTexto.match(
        /(\d{4})-(\d{2})-(\d{2})/
      );


    if (
      !coincidenciaFecha
    ) {

      return 0;

    }


    const año =
      Number(
        coincidenciaFecha[1]
      );

    const mes =
      Number(
        coincidenciaFecha[2]
      ) - 1;

    const dia =
      Number(
        coincidenciaFecha[3]
      );


    const horaTexto =
      String(
        resultado?.hora ?? ""
      )
        .trim()
        .toLowerCase();


    const coincidenciaHora =
      horaTexto.match(
        /(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?/i
      );


    if (
      !coincidenciaHora
    ) {

      return new Date(
        año,
        mes,
        dia
      ).getTime();

    }


    let hora =
      Number(
        coincidenciaHora[1]
      );

    const minuto =
      Number(
        coincidenciaHora[2]
      );


    const periodo =
      String(
        coincidenciaHora[3] || ""
      )
        .replace(/\s/g, "")
        .replace(/\./g, "");


    if (
      periodo === "pm" &&
      hora < 12
    ) {

      hora += 12;

    }


    if (
      periodo === "am" &&
      hora === 12
    ) {

      hora = 0;

    }


    return new Date(
      año,
      mes,
      dia,
      hora,
      minuto,
      0,
      0
    ).getTime();

  }


  lista.sort(
    (a, b) =>
      obtenerOrdenResultado(a) -
      obtenerOrdenResultado(b)
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


  const mapa =
    obtenerMapaPronosticos(
      pronosticos
    );


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
            String(
              resultado.animal
            )
              .trim()
              .toUpperCase();


          return `
            <div
              class="resultado-hoy"
              ${
                acierto
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
                  nombre
                )}

                ${nombre}

              </strong>


              <span>
                #${resultado.numero}
              </span>


              <small>
                🕐
                ${resultado.hora || ""}
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
PRONÓSTICOS
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

  if (!contenedor) {
    return;
  }

  const pronosticos =
    Array.isArray(
      datos.pronosticos
    )
      ? datos.pronosticos
          .slice(0, 3)
      : [];


  if (
    pronosticos.length === 0
  ) {

    contenedor.innerHTML = `
      <div
        style="
          text-align:center;
          padding:25px 10px;
        "
      >

        <h2>
          ⚠️ Sin pronóstico disponible
        </h2>

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

      <h1>
        🎯 POSIBILIDADES DEL DÍA
      </h1>


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
              <div
                class="pronostico-animal"
              >

                <h2>

                  ${posicion}

                  ${obtenerEmoji(
                    nombre
                  )}

                  ${nombre}

                </h2>


                ${
                  animal.numero !==
                  null &&
                  animal.numero !==
                  undefined &&
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


                      <p>
                        🎯 Resultado:
                        <strong>
                          #${resultado.numero}
                          ${
                            resultado.hora
                              ? " · " +
                                formatearHoraResultado(
                                  resultado.hora ||
                                  resultado.fecha
                                )
                              : ""
                          }
                        </strong>
                      </p>
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
    document.getElementById(
      "top10"
    );

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  if (
    !Array.isArray(
      datos.top10
    )
  ) {
    return;
  }

  datos.top10.forEach(
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

              ${obtenerEmoji(
                nombre
              )}

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
    document.getElementById(
      "atrasados"
    );

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  if (
    Array.isArray(
      datos.atrasados
    ) &&
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

                ${obtenerEmoji(
                  nombre
                )}

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

  else {

    const texto =
      loteriaActual ===
      "caballos"
        ? "No hay caballos con 7 o más días de atraso."
        : "No hay animales con 7 o más días de atraso.";


    tabla.innerHTML = `
      <tr>

        <td colspan="5">
          ${texto}
        </td>

      </tr>
    `;

  }

}


/*
==================================================
ANIMALES / CABALLOS
==================================================
*/

function pintarAnimales(datos) {

  const contenedor =
    document.getElementById(
      "animales"
    );

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";

  if (
    !Array.isArray(
      animales
    )
  ) {
    return;
  }

  animales.forEach(
    animal => {

      const nombre =
        animal.animal ||
        animal.caballo ||
        "SIN NOMBRE";


      const dato =
        Array.isArray(
          datos.top10
        )
          ? datos.top10.find(
              x =>
                normalizarTexto(
                  x.animal ||
                  x.caballo
                ) ===
                normalizarTexto(
                  nombre
                )
            )
          : null;


      const resultados =
        buscarResultadosAnimal(
          animal,
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


      let estado = `
        <small>
          ⏳ No salió hoy
        </small>
      `;


      if (
        resultados.length > 0
      ) {

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
        <div
          class="animal ${clase}"
        >

          <strong>
            ${
              animal.numero !==
              undefined &&
              animal.numero !==
              null &&
              animal.numero !== ""
                ? animal.numero
                : ""
            }
          </strong>


          <br>


          ${obtenerEmoji(
            nombre
          )}


          ${nombre}


          <br>


          ${estado}

        </div>
      `;

    }
  );

}


/*
==================================================
ESTADÍSTICAS
==================================================
*/

function pintarEstadisticas(
  datos,
  configuracion
) {

  const contenedor =
    document.getElementById(
      "estadistica"
    );

  if (!contenedor) {
    return;
  }

  const estadisticas =
    datos.estadisticas ||
    {};


  const totalHistorial =
    Number(
      datos.historial
    ) || 0;


  const totalAnimales =
    Number(
      estadisticas.totalAnimales
    ) ||
    Number(
      datos.totalAnimales
    ) ||
    (
      Array.isArray(animales)
        ? animales.length
        : 0
    );


  const totalAtrasados =
    Number(
      estadisticas.totalAtrasados
    ) || 0;


  const mayorAtraso =
    estadisticas.mayorAtraso ||
    "N/A";


  const diasMayorAtraso =
    Number(
      estadisticas.diasMayorAtraso
    ) || 0;


  const candidatos =
    Number(
      estadisticas.candidatosPronostico
    ) ||
    Number(
      estadisticas.candidatos
    ) ||
    0;


  const pronosticos =
    Array.isArray(
      datos.pronosticos
    )
      ? datos.pronosticos
      : [];


  const etiqueta =
    loteriaActual ===
    "caballos"
      ? "🐎 Total de caballos:"
      : "🐾 Total de animalitos:";


  contenedor.innerHTML = `
    <div
      class="estadisticas-grid"
    >

      <p>
        ${etiqueta}

        <strong>
          ${totalAnimales}
        </strong>
      </p>


      <p>
        📚 Historial:

        <strong>
          ${totalHistorial}
        </strong>
      </p>


      <p>
        ⏳ Total atrasados:

        <strong>
          ${totalAtrasados}
        </strong>
      </p>


      <p>
        🚨 Mayor atraso:

        <strong>
          ${mayorAtraso}
        </strong>
      </p>


      <p>
        📅 Días de atraso:

        <strong>
          ${diasMayorAtraso}
        </strong>
      </p>


      <p>
        🎯 Candidatos:

        <strong>
          ${candidatos}
        </strong>
      </p>


      <p>
        🔥 Pronósticos de hoy:

        <strong>
          ${pronosticos.length}
        </strong>
      </p>


      <p>
        🎰 Lotería:

        <strong>
          ${configuracion.nombre}
        </strong>
      </p>

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


  const pronostico =
    document.getElementById(
      "pronostico"
    );


  if (pronostico) {

    pronostico.innerHTML = `
      <h1>
        Analizando...
      </h1>

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
            "Cache-Control":
              "no-cache"
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


    if (
      loteriaActual ===
      "caballos" &&
      Array.isArray(
        datos.animales
      )
    ) {

      animales =
        datos.animales.map(
          caballo => ({

            animal:
              caballo.animal ||
              caballo.caballo ||
              caballo.nombre ||
              "",

            caballo:
              caballo.caballo ||
              caballo.animal ||
              caballo.nombre ||
              "",

            numero:
              caballo.numero ??
              ""

          })
        );

    }

    else {

      actualizarListaAnimales();

    }


    pintarPronosticos(
      datos,
      configuracion
    );


    mostrarResultadosHoy(
      datos.resultadosHoy,
      datos.pronosticos
    );


    pintarTop10(
      datos
    );


    pintarAtrasados(
      datos
    );


    pintarAnimales(
      datos
    );


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

          <h2>
            ⚠️ ERROR XTREME
          </h2>


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
      document.getElementById(
        "estadistica"
      );


    if (estadistica) {

      estadistica.innerHTML = `
        ⚠️ No se pudo cargar el análisis.
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
            "Cache-Control":
              "no-cache"
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


    await cargarAnalisis();


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
    document.getElementById(
      "selectorLoteria"
    );


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


        animales =
          obtenerListaAnimales(
            loteriaActual
          );


        cargarAnalisis();

      }
    );

  }


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

}


/*
==================================================
INICIAR XTREME
==================================================
*/

function iniciarXTREME() {

  try {

    actualizarListaAnimales();

    inicializarControles();

    cargarAnalisis();

  } catch (error) {

    console.error(
      "ERROR AL INICIAR XTREME:",
      error
    );


    const pronostico =
      document.getElementById(
        "pronostico"
      );


    if (pronostico) {

      pronostico.innerHTML = `
        <div
          style="
            text-align:center;
            padding:20px;
          "
        >

          <h2>
            ⚠️ ERROR XTREME
          </h2>

          <p>
            ${error.message}
          </p>

        </div>
      `;

    }

  }

}


/*
==================================================
ARRANQUE
==================================================
*/

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    iniciarXTREME
  );

}

else {

  iniciarXTREME();

}
