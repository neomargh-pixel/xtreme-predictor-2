import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";

export default async function handler(req, res) {

  try {

    // ==========================================
    // OBTENER HISTORIAL ACTUAL
    // ==========================================

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) throw error;


    if (!Array.isArray(historial) || historial.length === 0) {

      return res.status(200).json({

        ok: true,

        historial: 0,

        pronostico: null,

        top10: [],

        atrasados: [],

        estadisticas: {

          totalAnimales: 77,

          totalHistorial: 0,

          totalAtrasados: 0,

          mayorAtraso: null,

          diasMayorAtraso: 0,

          candidatosPronostico: 0,

          pronosticoActual: null,

          diasPronostico: 0

        }

      });

    }


    // ==========================================
    // ANALIZAR HISTORIAL
    // ==========================================

    const analisis =
      analizarResultados(historial);


    // ==========================================
    // TOP 10 XTREME
    // ==========================================

    const top10 =
      analisis
        .slice()
        .sort((a, b) => {

          if (b.indice !== a.indice) {

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

        })
        .slice(0, 10);



    // ==========================================
    // TODOS LOS ANIMALES ATRASADOS
    //
    // IMPORTANTE:
    //
    // Esta variable contiene TODOS los animales
    // que tienen al menos 1 día sin salir.
    //
    // NO está limitada a 10.
    // ==========================================

    const todosAtrasados =
      analisis
        .filter(
          a =>
            Number(a.diasSinSalir) >= 1
        )
        .slice()
        .sort((a, b) => {

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


          return (
            a.salidas30 -
            b.salidas30
          );

        });



    // ==========================================
    // TOTAL REAL DE ATRASADOS
    // ==========================================

    const totalAtrasados =
      todosAtrasados.length;



    // ==========================================
    // LISTA DE ATRASADOS PARA LA PÁGINA
    //
    // SOLO MOSTRAMOS LOS 10 PRIMEROS.
    //
    // PERO EL TOTAL SE CALCULA ARRIBA CON
    // TODOS LOS ANIMALES.
    // ==========================================

    const atrasados =
      todosAtrasados.slice(0, 10);



    // ==========================================
    // FECHA DE REFERENCIA
    // ==========================================

    const fechas =
      historial
        .map(r => r.fecha)
        .filter(Boolean)
        .map(
          r =>
            String(r).substring(0, 10)
        )
        .sort();


    const fechaReferencia =
      fechas[fechas.length - 1] ||
      null;



    // ==========================================
    // CANDIDATOS PARA PRONÓSTICO
    //
    // PRIORIDAD:
    //
    // 1. ATRASO
    // 2. ÍNDICE
    // 3. MENOS ACTIVIDAD RECIENTE
    // ==========================================

    let candidatos =
      analisis
        .filter(
          a =>
            Number(a.diasSinSalir) >= 3
        )
        .slice()
        .sort((a, b) => {

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


          return (
            a.salidas30 -
            b.salidas30
          );

        });



    // ==========================================
    // SI HAY POCOS CON 3+ DÍAS
    // BAJAMOS A 2 DÍAS
    // ==========================================

    if (
      candidatos.length < 5
    ) {

      candidatos =
        analisis
          .filter(
            a =>
              Number(a.diasSinSalir) >= 2
          )
          .slice()
          .sort((a, b) => {

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


            return (
              a.salidas14 -
              b.salidas14
            );

          });

    }



    // ==========================================
    // SI TODAVÍA HAY POCOS
    // USAMOS LOS QUE TIENEN 1+ DÍA
    // ==========================================

    if (
      candidatos.length < 5
    ) {

      candidatos =
        analisis
          .filter(
            a =>
              Number(a.diasSinSalir) >= 1
          )
          .slice()
          .sort((a, b) => {

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


            return (
              a.salidas7 -
              b.salidas7
            );

          });

    }



    // ==========================================
    // PRONÓSTICO
    // ==========================================

    let pronostico =
      candidatos[0] ||
      null;



    // ==========================================
    // PROTECCIÓN CONTRA REPETICIÓN
    //
    // Si llega:
    //
    // ?anterior=GUACAMAYA
    //
    // buscamos otro candidato.
    // ==========================================

    const anterior =
      req.query &&
      req.query.anterior
        ? String(
            req.query.anterior
          )
            .trim()
            .toUpperCase()
        : null;


    if (
      anterior &&
      pronostico &&
      pronostico.animal === anterior
    ) {

      const siguiente =
        candidatos.find(
          a =>
            a.animal !== anterior
        );


      if (siguiente) {

        pronostico =
          siguiente;

      }

    }



    // ==========================================
    // MAYOR ATRASO REAL
    //
    // SE CALCULA CON TODOS LOS ATRASADOS,
    // NO CON LOS 10 QUE SE MUESTRAN.
    // ==========================================

    const mayorAtraso =
      todosAtrasados.length > 0
        ? todosAtrasados[0]
        : null;



    // ==========================================
    // ESTADÍSTICAS ACTUALES
    // ==========================================

    const estadisticas = {

      // Cantidad real de animales analizados
      totalAnimales:
        analisis.length,


      // Cantidad real de registros
      totalHistorial:
        historial.length,


      // CANTIDAD REAL DE ATRASADOS
      //
      // Ya NO será siempre 10.
      totalAtrasados:
        totalAtrasados,


      // Animal con mayor atraso
      mayorAtraso:
        mayorAtraso
          ? mayorAtraso.animal
          : null,


      // Días del mayor atraso
      diasMayorAtraso:
        mayorAtraso
          ? mayorAtraso.diasSinSalir
          : 0,


      // Cantidad de candidatos
      candidatosPronostico:
        candidatos.length,


      // Pronóstico actual
      pronosticoActual:
        pronostico
          ? pronostico.animal
          : null,


      // Días sin salir del pronóstico
      diasPronostico:
        pronostico
          ? pronostico.diasSinSalir
          : 0

    };



    // ==========================================
    // FECHAS ÚNICAS
    // ==========================================

    const fechasUnicas = [
      ...new Set(
        fechas
      )
    ];



    // ==========================================
    // RESPUESTA FINAL
    // ==========================================

    return res.status(200).json({

      ok: true,


      historial:
        historial.length,


      DIAGNOSTICO: {

        fechaMasAntigua:
          fechas[0] ||
          null,


        fechaMasReciente:
          fechas[fechas.length - 1] ||
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


        candidatosPronostico:
          candidatos.length,


        totalAtrasados:
          totalAtrasados

      },


      pronostico:


        pronostico,


      top10:


        top10,


      atrasados:


        atrasados,


      estadisticas:


        estadisticas

    });


  } catch (error) {


    console.error(
      "ERROR /api/analizar:",
      error
    );


    return res.status(500).json({

      ok: false,

      error:
        error.message ||
        "Error interno del servidor"

    });

  }

}
