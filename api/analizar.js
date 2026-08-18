import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";

export default async function handler(req, res) {

  try {

    // ==========================================
    // OBTENER HISTORIAL
    // ==========================================

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) throw error;


    // ==========================================
    // SIN HISTORIAL
    // ==========================================

    if (!Array.isArray(historial) || historial.length === 0) {

      return res.status(200).json({

        ok: true,

        historial: 0,

        pronosticos: [],

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

          pronosticosHoy: 0,

          pronosticoActual: null,

          diasPronostico: 0

        }

      });

    }


    // ==========================================
    // ANALIZAR LOS 77 ANIMALITOS
    // ==========================================

    const analisis =
      analizarResultados(historial);


    // ==========================================
    // FECHAS
    // ==========================================

    const fechas = historial

      .map(r => r.fecha)

      .filter(Boolean)

      .map(r => String(r).substring(0, 10))

      .sort();


    const fechaReferencia =
      fechas[fechas.length - 1] || null;


    const fechasUnicas = [
      ...new Set(fechas)
    ];


    // ==========================================
    // TOP 10 XTREME
    // ==========================================

    const top10 = analisis

      .slice()

      .sort((a, b) => {

        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        if (b.salidas7 !== a.salidas7) {
          return b.salidas7 - a.salidas7;
        }

        if (b.salidas14 !== a.salidas14) {
          return b.salidas14 - a.salidas14;
        }

        if (b.salidas30 !== a.salidas30) {
          return b.salidas30 - a.salidas30;
        }

        return b.salidas - a.salidas;

      })

      .slice(0, 10);


    // ==========================================
    // ANIMALES ATRASADOS
    // ==========================================

    const todosAtrasados = analisis

      .filter(
        a => a.diasSinSalir >= 7
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

        return b.indice - a.indice;

      });


    const atrasados =
      todosAtrasados.slice(0, 10);


    const totalAtrasados =
      todosAtrasados.length;


    // ==========================================
    // HISTORIAL DE PRONÓSTICOS ANTERIORES
    // ==========================================

    let recientes = [];


    if (
      req.query &&
      req.query.recientes
    ) {

      recientes =
        String(
          req.query.recientes
        )

        .split(",")

        .map(a =>
          String(a)
            .trim()
            .toUpperCase()
        )

        .filter(Boolean);

    }


    // ==========================================
    // CANDIDATOS
    //
    // BUSCAMOS ANIMALITOS CON BUEN ÍNDICE
    // Y CON CONDICIONES INTERESANTES.
    // ==========================================

    let candidatos =
      analisis

        .filter(a =>
          a.diasSinSalir >= 2
        )

        .slice()

        .sort((a, b) => {

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
            b.salidas30 -
            a.salidas30
          );

        });


    // ==========================================
    // EVITAR REPETIR PRONÓSTICOS RECIENTES
    //
    // No queremos que Xtreme se quede pegado
    // al mismo animal varios días.
    // ==========================================

    const candidatosNuevos =
      candidatos.filter(
        a =>
          !recientes.includes(
            String(a.animal)
              .trim()
              .toUpperCase()
          )
      );


    /*
    Si tenemos suficientes candidatos nuevos,
    usamos solamente esos.

    Si no hay suficientes, usamos los mejores
    disponibles para que el sistema nunca
    quede sin pronóstico.
    */

    if (
      candidatosNuevos.length >= 3
    ) {

      candidatos =
        candidatosNuevos;

    }


    // ==========================================
    // PRONÓSTICO DEL DÍA
    //
    // AHORA SON 3 ANIMALITOS.
    // ==========================================

    const pronosticos =
      candidatos.slice(0, 3);


    // ==========================================
    // DIAGNÓSTICO
    // ==========================================

    console.log(
      "PRONÓSTICOS XTREME:",
      pronosticos.map(a => ({

        animal:
          a.animal,

        indice:
          a.indice,

        porcentaje:
          a.porcentaje,

        diasSinSalir:
          a.diasSinSalir,

        salidas7:
          a.salidas7,

        salidas14:
          a.salidas14,

        salidas30:
          a.salidas30,

        tendencia:
          a.tendencia,

        categoria:
          a.categoria

      }))
    );


    // ==========================================
    // PRONÓSTICO PRINCIPAL
    //
    // Se mantiene para compatibilidad.
    // El verdadero pronóstico diario está
    // en "pronosticos".
    // ==========================================

    const pronostico =
      pronosticos[0] || null;


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    const mayorAtraso =
      todosAtrasados.length > 0
        ? todosAtrasados[0]
        : null;


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
        candidatos.length,

      pronosticosHoy:
        pronosticos.length,

      pronosticoActual:
        pronosticos.length > 0
          ? pronosticos
              .map(a => a.animal)
              .join(" • ")
          : null,

      diasPronostico:
        pronostico
          ? pronostico.diasSinSalir
          : 0

    };


    // ==========================================
    // RESPUESTA FINAL
    // ==========================================

    return res.status(200).json({

      ok: true,

      historial:
        historial.length,

      DIAGNOSTICO: {

        fechaMasAntigua:
          fechas[0] || null,

        fechaMasReciente:
          fechas[fechas.length - 1] || null,

        cantidadFechasDiferentes:
          fechasUnicas.length,

        primeras5Fechas:
          fechasUnicas.slice(0, 5),

        ultimas5Fechas:
          fechasUnicas.slice(-5),

        candidatosPronostico:
          candidatos.length,

        pronosticosHoy:
          pronosticos.length,

        totalAtrasados:
          totalAtrasados

      },

      // ========================================
      // LOS 3 PRONÓSTICOS DEL DÍA
      // ========================================

      pronosticos,

      // Compatibilidad con el código anterior
      pronostico,

      top10,

      atrasados,

      estadisticas

    });


  } catch (error) {

    console.error(error);


    return res.status(500).json({

      ok: false,

      error:
        error.message

    });

  }

}
