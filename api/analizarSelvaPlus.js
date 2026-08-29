import supabase from "../lib/supabase.js";


/*
==================================================
XTREME PREDICTOR 2.0
ANÁLISIS — SELVA PLUS
==================================================
*/


/*
==================================================
FECHA ACTUAL DE CARACAS
==================================================
*/

function obtenerHoyCaracas() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(
    new Date()
  );

}


/*
==================================================
FECHA DEL RESULTADO
==================================================
*/

function obtenerFechaResultado(
  fecha
) {

  if (!fecha) {
    return null;
  }

  const texto =
    String(fecha).trim();

  const match =
    texto.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

  if (!match) {
    return null;
  }

  return match[1];

}


/*
==================================================
HORA DEL RESULTADO
==================================================
*/

function obtenerHoraCaracas(
  fecha
) {

  if (!fecha) {
    return null;
  }

  const texto =
    String(fecha).trim();


  const match =
    texto.match(
      /(?:T|\s)(\d{1,2}):(\d{2})(?::\d{2})?/
    );


  if (!match) {
    return null;
  }


  let hora =
    parseInt(
      match[1],
      10
    );


  const minutos =
    match[2];


  let periodo;


  if (hora >= 12) {

    periodo =
      "p. m.";

  }

  else {

    periodo =
      "a. m.";

  }


  if (hora === 0) {

    hora = 12;

  }

  else if (hora > 12) {

    hora -= 12;

  }


  return (
    `${String(hora).padStart(2, "0")}:${minutos} ${periodo}`
  );

}


/*
==================================================
OBTENER TODO EL HISTORIAL
==================================================
*/

async function obtenerTodoHistorial() {

  const resultados = [];

  const bloque = 1000;

  let desde = 0;


  while (true) {

    const hasta =
      desde +
      bloque -
      1;


    const {
      data,
      error
    } =
      await supabase
        .from(
          "historial_selvaplus"
        )
        .select("*")
        .order(
          "fecha",
          {
            ascending: false
          }
        )
        .range(
          desde,
          hasta
        );


    if (error) {
      throw error;
    }


    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      break;

    }


    resultados.push(
      ...data
    );


    if (
      data.length < bloque
    ) {

      break;

    }


    desde += bloque;

  }


  return resultados;

}


/*
==================================================
HANDLER
==================================================
*/

export default async function handler(
  req,
  res
) {

  try {

    /*
    ==========================================
    HISTORIAL
    ==========================================
    */

    const historial =
      await obtenerTodoHistorial();


    /*
    ==========================================
    SIN HISTORIAL
    ==========================================
    */

    if (
      !Array.isArray(historial) ||
      historial.length === 0
    ) {

      return res.status(
        200
      ).json({

        ok: true,

        loteria:
          "Selva Plus",

        historial:
          0,

        hoy:
          obtenerHoyCaracas(),

        pronosticos: [],

        pronostico:
          null,

        top10: [],

        atrasados: [],

        resultadosHoy: {},

        estadisticas: {

          totalAnimales:
            38,

          totalHistorial:
            0,

          totalAtrasados:
            0,

          mayorAtraso:
            null,

          diasMayorAtraso:
            0,

          candidatosPronostico:
            0,

          pronosticosHoy:
            0,

          pronosticoActual:
            null,

          diasPronostico:
            0

        }

      });

    }


    /*
    ==========================================
    HOY
    ==========================================
    */

    const hoyCaracas =
      obtenerHoyCaracas();


    /*
    ==========================================
    AGRUPAR POR ANIMAL
    ==========================================
    */

    const porAnimal = {};


    historial.forEach(
      resultado => {

        if (
          !resultado ||
          !resultado.animal
        ) {

          return;

        }


        const nombre =
          String(
            resultado.animal
          )
            .trim()
            .toUpperCase();


        if (
          !porAnimal[nombre]
        ) {

          porAnimal[nombre] =
            [];

        }


        porAnimal[nombre].push(
          resultado
        );

      }
    );


    /*
    ==========================================
    FECHAS DEL HISTORIAL
    ==========================================
    */

    const fechas =
      historial
        .map(
          resultado =>
            obtenerFechaResultado(
              resultado.fecha
            )
        )
        .filter(Boolean);


    /*
    ==========================================
    ANÁLISIS POR ANIMAL
    ==========================================
    */

    const analisis = [];


    Object.entries(
      porAnimal
    ).forEach(
      ([
        animal,
        registros
      ]) => {

        const fechasAnimal =
          [
            ...new Set(
              registros
                .map(
                  resultado =>
                    obtenerFechaResultado(
                      resultado.fecha
                    )
                )
                .filter(Boolean)
            )
          ]
          .sort();


        const ultimaFecha =
          fechasAnimal.length > 0
            ? fechasAnimal[
                fechasAnimal.length - 1
              ]
            : null;


        let diasSinSalir = 0;


        if (
          ultimaFecha
        ) {

          const ultima =
            new Date(
              `${ultimaFecha}T00:00:00`
            );


          const hoy =
            new Date(
              `${hoyCaracas}T00:00:00`
            );


          diasSinSalir =
            Math.max(
              0,
              Math.floor(
                (
                  hoy -
                  ultima
                ) /
                86400000
              )
            );

        }


        const salidas7 =
          fechasAnimal.filter(
            fecha => {

              const d =
                new Date(
                  `${fecha}T00:00:00`
                );


              const hoy =
                new Date(
                  `${hoyCaracas}T00:00:00`
                );


              const diferencia =
                Math.floor(
                  (
                    hoy -
                    d
                  ) /
                  86400000
                );


              return (
                diferencia >= 0 &&
                diferencia <= 7
              );

            }
          ).length;


        const salidas14 =
          fechasAnimal.filter(
            fecha => {

              const d =
                new Date(
                  `${fecha}T00:00:00`
                );


              const hoy =
                new Date(
                  `${hoyCaracas}T00:00:00`
                );


              const diferencia =
                Math.floor(
                  (
                    hoy -
                    d
                  ) /
                  86400000
                );


              return (
                diferencia >= 0 &&
                diferencia <= 14
              );

            }
          ).length;


        const salidas30 =
          fechasAnimal.filter(
            fecha => {

              const d =
                new Date(
                  `${fecha}T00:00:00`
                );


              const hoy =
                new Date(
                  `${hoyCaracas}T00:00:00`
                );


              const diferencia =
                Math.floor(
                  (
                    hoy -
                    d
                  ) /
                  86400000
                );


              return (
                diferencia >= 0 &&
                diferencia <= 30
              );

            }
          ).length;


        const salidas =
          fechasAnimal.length;


        /*
        ========================================
        ÍNDICE XTREME
        ========================================
        */

        const indice =
          Math.min(
            100,
            Math.round(

              (
                salidas7 * 8
              ) +

              (
                salidas14 * 3
              ) +

              (
                salidas30
              ) +

              (
                Math.min(
                  diasSinSalir * 2,
                  20
                )
              )

            )
          );


        const porcentaje =
          Math.min(
            95,
            Math.max(
              50,
              indice + 15
            )
          );


        let tendencia =
          "BAJA";


        if (
          indice >= 80
        ) {

          tendencia =
            "MUY ALTA";

        }

        else if (
          indice >= 60
        ) {

          tendencia =
            "ALTA";

        }

        else if (
          indice >= 40
        ) {

          tendencia =
            "MEDIA";

        }

        else if (
          indice >= 20
        ) {

          tendencia =
            "NORMAL";

        }


        const ultimoRegistro =
          registros
            .slice()
            .sort(
              (a, b) =>
                String(
                  b.fecha
                ).localeCompare(
                  String(
                    a.fecha
                  )
                )
            )[0];


        const numero =
          ultimoRegistro?.numero ??
          null;


        analisis.push({

          animal,

          numero,

          salidas,

          fechas:
            fechasAnimal,

          ultimaFecha,

          diasSinSalir,

          salidas7,

          salidas14,

          salidas30,

          indice,

          porcentaje,

          tendencia,

          salioHoy:
            false,

          resultadosHoy:
            [],

          horariosHoy:
            [],

          resultadoHoy:
            "NO SALIO",

          pronostico:
            false,

          categoria:
            "OBSERVACION"

        });

      }
    );


    /*
    ==========================================
    RESULTADOS DE HOY
    ==========================================
    */

    const resultadosHoy =
      {};


    historial.forEach(
      resultado => {

        const fecha =
          obtenerFechaResultado(
            resultado.fecha
          );


        if (
          fecha !==
          hoyCaracas
        ) {

          return;

        }


        const nombre =
          String(
            resultado.animal
          )
            .trim()
            .toUpperCase();


        if (
          !resultadosHoy[
            nombre
          ]
        ) {

          resultadosHoy[
            nombre
          ] = [];

        }


        resultadosHoy[
          nombre
        ].push({

          numero:
            resultado.numero,

          fecha:
            resultado.fecha,

          hora:
            obtenerHoraCaracas(
              resultado.fecha
            )

        });

      }
    );


    /*
    ==========================================
    MARCAR RESULTADOS DE HOY
    ==========================================
    */

    analisis.forEach(
      animal => {

        const nombre =
          String(
            animal.animal
          )
            .trim()
            .toUpperCase();


        const resultados =
          resultadosHoy[
            nombre
          ] || [];


        animal.salioHoy =
          resultados.length > 0;


        animal.resultadosHoy =
          resultados;


        animal.horariosHoy =
          resultados.map(
            resultado =>
              resultado.hora
          );


        animal.resultadoHoy =
          resultados.length > 0
            ? "SALIO"
            : "NO SALIO";

      }
    );


    /*
    ==========================================
    TOP 10
    ==========================================
    */

    const top10 =
      analisis
        .slice()
        .sort(
          (a, b) => {

            if (
              b.indice !==
              a.indice
            ) {

              return (
                b.indice -
                a.indice
              );

            }


            if (
              b.diasSinSalir !==
              a.diasSinSalir
            ) {

              return (
                b.diasSinSalir -
                a.diasSinSalir
              );

            }


            if (
              b.salidas7 !==
              a.salidas7
            ) {

              return (
                b.salidas7 -
                a.salidas7
              );

            }


            if (
              b.salidas14 !==
              a.salidas14
            ) {

              return (
                b.salidas14 -
                a.salidas14
              );

            }


            return (
              b.salidas30 -
              a.salidas30
            );

          }
        )
        .slice(
          0,
          10
        );


    /*
    ==========================================
    ATRASADOS
    ==========================================
    */

    const todosAtrasados =
      analisis
        .filter(
          animal =>
            animal.diasSinSalir >= 7
        )
        .sort(
          (a, b) => {

            if (
              b.diasSinSalir !==
              a.diasSinSalir
            ) {

              return (
                b.diasSinSalir -
                a.diasSinSalir
              );

            }


            return (
              b.indice -
              a.indice
            );

          }
        );


    const atrasados =
      todosAtrasados.slice(
        0,
        10
      );


    /*
    ==========================================
    PRONÓSTICOS
    ==========================================
    */

    const pronosticos =
      analisis
        .slice()
        .sort(
          (a, b) => {

            if (
              b.indice !==
              a.indice
            ) {

              return (
                b.indice -
                a.indice
              );

            }


            if (
              b.salidas7 !==
              a.salidas7
            ) {

              return (
                b.salidas7 -
                a.salidas7
              );

            }


            if (
              b.salidas14 !==
              a.salidas14
            ) {

              return (
                b.salidas14 -
                a.salidas14
              );

            }


            return (
              b.salidas30 -
              a.salidas30
            );

          }
        )
        .slice(
          0,
          3
        );


    /*
    ==========================================
    MARCAR PRONÓSTICOS
    ==========================================
    */

    analisis.forEach(
      animal => {

        animal.pronostico =
          false;

      }
    );


    pronosticos.forEach(
      animal => {

        animal.pronostico =
          true;

        animal.categoria =
          "PRONÓSTICO";

      }
    );


    /*
    ==========================================
    PRONÓSTICO PRINCIPAL
    ==========================================
    */

    const pronostico =
      pronosticos[0] ||
      null;


    /*
    ==========================================
    ESTADÍSTICAS
    ==========================================
    */

    const mayorAtraso =
      todosAtrasados[0] ||
      null;


    const estadisticas = {

      totalAnimales:
        38,

      totalHistorial:
        historial.length,

      totalAtrasados:
        todosAtrasados.length,

      mayorAtraso:
        mayorAtraso
          ? mayorAtraso.animal
          : null,

      diasMayorAtraso:
        mayorAtraso
          ? mayorAtraso.diasSinSalir
          : 0,

      candidatosPronostico:
        analisis.length,

      pronosticosHoy:
        pronosticos.length,

      pronosticoActual:
        pronosticos.length > 0

          ?

          pronosticos
            .map(
              animal =>
                animal.animal
            )
            .join(
              " • "
            )

          :

          null,

      diasPronostico:
        pronostico
          ? pronostico.diasSinSalir
          : 0

    };


    /*
    ==========================================
    DIAGNÓSTICO
    ==========================================
    */

    const fechasUnicas =
      [
        ...new Set(
          fechas
        )
      ]
      .sort();


    console.log(
      "XTREME SELVA PLUS:",
      {

        hoy:
          hoyCaracas,

        historial:
          historial.length,

        fechas:
          fechasUnicas.length,

        pronosticos:
          pronosticos.map(
            animal =>
              animal.animal
          ),

        resultadosHoy:
          Object.keys(
            resultadosHoy
          )

      }
    );


    /*
    ==========================================
    RESPUESTA
    ==========================================
    */

    return res.status(
      200
    ).json({

      ok: true,

      loteria:
        "Selva Plus",

      fuente:
        "LotoVen",

      historial:
        historial.length,

      hoy:
        hoyCaracas,

      pronosticos,

      pronostico,

      top10,

      atrasados,

      resultadosHoy,

      estadisticas

    });

  }

  catch (error) {

    console.error(
      "ERROR EN /api/analizarSelvaPlus:",
      error
    );


    return res.status(
      500
    ).json({

      ok: false,

      error:
        error.message ||
        "Error interno analizando Selva Plus."

    });

  }

}
