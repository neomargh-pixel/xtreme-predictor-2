      import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";


/*
==================================================
FECHA CARACAS
==================================================
*/

function obtenerFechaCaracas(fecha) {

  if (!fecha) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(
    new Date(fecha)
  );

}


/*
==================================================
HORA CARACAS
==================================================
*/

function obtenerHoraCaracas(fecha) {

  if (!fecha) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "es-VE",
    {
      timeZone: "America/Caracas",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  ).format(
    new Date(fecha)
  );

}


/*
==================================================
OBTENER TODO EL HISTORIAL
==================================================

SUPABASE PUEDE LIMITAR LA RESPUESTA A 1000
REGISTROS.

POR ESO CARGAMOS POR BLOQUES.
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
        .from("historial")
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
    HISTORIAL COMPLETO
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

      return res.status(200).json({

        ok: true,

        historial: 0,

        hoy:
          obtenerFechaCaracas(
            new Date()
          ),

        pronosticos: [],

        pronostico: null,

        top10: [],

        atrasados: [],

        resultadosHoy: {},

        estadisticas: {

          totalAnimales: 77,

          totalHistorial: 0,

          totalAtrasados: 0,

          mayorAtraso: null,

          diasMayorAtraso: 0,

          candidatosPronostico: 0,

          pronosticosHoy: 0,

          pronosticoActual: null,

          diasPronostico: 0

        }

      });

    }


    /*
    ==========================================
    ANALIZAR LOS 77
    ==========================================
    */

    const analisis =
      analizarResultados(
        historial
      );


    /*
    ==========================================
    RESULTADOS DE HOY
    ==========================================
    */

    const hoyCaracas =
      obtenerFechaCaracas(
        new Date()
      );


    const resultadosHoyPorAnimal = {};


    historial.forEach(
      resultado => {

        if (
          !resultado.fecha ||
          !resultado.animal
        ) {

          return;

        }


        const fechaResultado =
          obtenerFechaCaracas(
            resultado.fecha
          );


        if (
          fechaResultado !==
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
          !resultadosHoyPorAnimal[
            nombre
          ]
        ) {

          resultadosHoyPorAnimal[
            nombre
          ] = [];

        }


        resultadosHoyPorAnimal[
          nombre
        ].push({

          hora:
            obtenerHoraCaracas(
              resultado.fecha
            ),

          fecha:
            resultado.fecha,

          numero:
            resultado.numero

        });

      }
    );


    /*
    ==========================================
    AÑADIR RESULTADO DE HOY A CADA ANIMAL
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
          resultadosHoyPorAnimal[
            nombre
          ] || [];


        animal.salioHoy =
          resultados.length > 0;


        animal.resultadosHoy =
          resultados;


        animal.horariosHoy =
          resultados.map(
            r => r.hora
          );


        animal.resultadoHoy =
          resultados.length > 0
            ? "SALIO"
            : "NO SALIO";

      }
    );


    /*
    ==========================================
    FECHAS
    ==========================================
    */

    const fechas =
      historial
        .map(
          r => r.fecha
        )
        .filter(Boolean)
        .map(
          r =>
            String(r).substring(
              0,
              10
            )
        )
        .sort();


    const fechasUnicas =
      [
        ...new Set(
          fechas
        )
      ];


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


            if (
              b.salidas30 !==
              a.salidas30
            ) {

              return (
                b.salidas30 -
                a.salidas30
              );

            }


            return (
              b.salidas -
              a.salidas
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
        .slice()
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
              a.salidas7 !==
              b.salidas7
            ) {

              return (
                a.salidas7 -
                b.salidas7
              );

            }


            if (
              a.salidas14 !==
              b.salidas14
            ) {

              return (
                a.salidas14 -
                b.salidas14
              );

            }


            if (
              a.salidas30 !==
              b.salidas30
            ) {

              return (
                a.salidas30 -
                b.salidas30
              );

            }


            return (
              b.salidas -
              a.salidas
            );

          }
        );


    const atrasados =
      todosAtrasados.slice(
        0,
        10
      );


    const totalAtrasados =
      todosAtrasados.length;


    /*
    ==========================================
    PRONÓSTICOS
    ==========================================

    IMPORTANTE:

    NO VOLVEMOS A CALCULAR LOS 3.

    ANALIZARRESULTADOS.JS YA LOS GENERÓ.

    USAMOS DIRECTAMENTE LOS QUE TIENEN
    pronostico === true.
    ==========================================
    */

    const pronosticos =
      analisis
        .filter(
          animal =>
            animal.pronostico === true
        )
        .slice(
          0,
          3
        );


    /*
    ==========================================
    MARCAR TODOS
    ==========================================
    */

    analisis.forEach(
      animal => {

        animal.pronostico =
          false;

        if (
          animal.resultadoHoy ===
          "SALIO"
        ) {

          animal.categoria =
            "SALIO_RECIENTE";

        }

      }
    );


    /*
    ==========================================
    MARCAR LOS 3
    ==========================================
    */

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
    MAYOR ATRASO
    ==========================================
    */

    const mayorAtraso =
      todosAtrasados.length > 0

        ? todosAtrasados[0]

        : null;


    /*
    ==========================================
    ESTADÍSTICAS
    ==========================================
    */

    const estadisticas = {

      totalAnimales:
        77,

      totalHistorial:
        historial.length,

      totalAtrasados:
        totalAtrasados,

      mayorAtraso:
        mayorAtraso
          ? mayorAtraso.animal
          : null,

      diasMayorAtraso:
        mayorAtraso
          ? mayorAtraso.diasSinSalir
          : 0,

      candidatosPronostico:
        analisis.filter(
          animal =>
            animal.diasSinSalir >= 2
        ).length,

      pronosticosHoy:
        pronosticos.length,

      pronosticoActual:
        pronosticos.length > 0

          ? pronosticos
              .map(
                animal =>
                  animal.animal
              )
              .join(" • ")

          : null,

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

    console.log(
      "XTREME API:",
      {

        hoy:
          hoyCaracas,

        historial:
          historial.length,

        pronosticos:
          pronosticos.map(
            animal =>
              animal.animal
          ),

        resultadosHoy:
          Object.keys(
            resultadosHoyPorAnimal
          ),

        top10:
          top10.map(
            animal =>
              animal.animal
          ),

        atrasados:
          atrasados.map(
            animal =>
              animal.animal
          )

      }
    );


    /*
    ==========================================
    RESPUESTA FINAL
    ==========================================
    */

    return res.status(200).json({

      ok: true,

      historial:
        historial.length,

      hoy:
        hoyCaracas,

      DIAGNOSTICO: {

        fechaMasAntigua:
          fechas[0] ||
          null,

        fechaMasReciente:
          fechas[
            fechas.length - 1
          ] ||
          null,

        cantidadFechasDiferentes:
          fechasUnicas.length,

        primeras5Fechas:
          fechasUnicas.slice(
            0,
            5
          ),

        ultimas5Fechas:
          fechasUnicas.slice(
            -5
          ),

        totalAtrasados:
          totalAtrasados,

        pronosticosHoy:
          pronosticos.length,

        pronosticosActuales:
          pronosticos.map(
            animal =>
              animal.animal
          ),

        resultadosHoy:
          Object.keys(
            resultadosHoyPorAnimal
          )

      },


      /*
      ========================================
      3 PRONÓSTICOS
      ========================================
      */

      pronosticos,


      /*
      COMPATIBILIDAD
      */

      pronostico,


      /*
      ========================================
      TOP 10
      ========================================
      */

      top10,


      /*
      ========================================
      ATRASADOS
      ========================================
      */

      atrasados,


      /*
      ========================================
      ESTADÍSTICAS
      ========================================
      */

      estadisticas,


      /*
      ========================================
      RESULTADOS DEL DÍA
      ========================================
      */

      resultadosHoy:
        resultadosHoyPorAnimal

    });


  } catch (error) {

    console.error(
      "ERROR EN /api/analizar:",
      error
    );


    return res.status(
      500
    ).json({

      ok: false,

      error:
        error.message ||
        "Error interno del servidor"

    });

  }

}
