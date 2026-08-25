import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";

function obtenerFechaCaracas(fecha) {
  if (!fecha) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(fecha));
}

function obtenerHoraCaracas(fecha) {
  if (!fecha) return null;

  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(new Date(fecha));
}

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
    // ANALIZAR HISTORIAL
    // ==========================================

    const analisis =
      analizarResultados(historial);


    // ==========================================
    // RESULTADOS DEL DÍA
    // ==========================================

    const hoyCaracas =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Caracas",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());


    /*
      Agrupamos los resultados de HOY por animal.

      Ejemplo:

      BALLENA:
      [
        "08:00 AM",
        "10:00 AM"
      ]

      Esto permite que el frontend muestre
      directamente el resultado dentro de
      cada animalito.
    */

    const resultadosHoyPorAnimal = {};


    historial.forEach(resultado => {

      if (!resultado.fecha || !resultado.animal) {
        return;
      }


      const fechaResultado =
        obtenerFechaCaracas(resultado.fecha);


      if (fechaResultado !== hoyCaracas) {
        return;
      }


      const nombre =
        String(resultado.animal)
          .trim()
          .toUpperCase();


      if (!resultadosHoyPorAnimal[nombre]) {

        resultadosHoyPorAnimal[nombre] = [];

      }


      resultadosHoyPorAnimal[nombre].push({

        hora:
          obtenerHoraCaracas(resultado.fecha),

        fecha:
          resultado.fecha,

        numero:
          resultado.numero

      });

    });


    /*
      Añadimos a cada animal:

      salioHoy
      horariosHoy
      resultadoHoy

      El resto de la información del análisis
      permanece intacta.
    */

    analisis.forEach(animal => {

      const nombre =
        String(animal.animal)
          .trim()
          .toUpperCase();


      const resultados =
        resultadosHoyPorAnimal[nombre] || [];


      animal.salioHoy =
        resultados.length > 0;


      animal.horariosHoy =
        resultados.map(r => r.hora);


      animal.resultadosHoy =
        resultados;


      animal.resultadoHoy =
        resultados.length > 0
          ? "SALIO"
          : "NO SALIO";

    });


    // ==========================================
    // FECHAS
    // ==========================================

    const fechas =
      historial
        .map(r => r.fecha)
        .filter(Boolean)
        .map(r =>
          String(r).substring(0, 10)
        )
        .sort();


    const fechasUnicas = [
      ...new Set(fechas)
    ];


    // ==========================================
    // TOP 10 XTREME
    // ==========================================

    const top10 =
      analisis
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

        })
        .slice(0, 10);


    // ==========================================
    // ANIMALES ATRASADOS
    // ==========================================

    const todosAtrasados =
      analisis
        .filter(a =>
          a.diasSinSalir >= 7
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

        });


    const atrasados =
      todosAtrasados.slice(0, 10);


    const totalAtrasados =
      todosAtrasados.length;


    // ==========================================
    // PRONÓSTICOS RECIENTES
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
    // ==========================================

    const candidatosBase =
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

        });


    // ==========================================
    // SEPARAR PENDIENTES Y NUEVOS
    // ==========================================

    const recientesSet =
      new Set(
        recientes
      );


    const pendientes =
      candidatosBase.filter(a => {

        const nombre =
          String(a.animal)
            .trim()
            .toUpperCase();

        return recientesSet.has(
          nombre
        );

      });


    const candidatosNuevos =
      candidatosBase.filter(a => {

        const nombre =
          String(a.animal)
            .trim()
            .toUpperCase();

        return !recientesSet.has(
          nombre
        );

      });


    // ==========================================
    // PRONÓSTICOS DEL DÍA
    // ==========================================

    let pronosticos = [];


    pendientes
      .slice(0, 3)
      .forEach(a => {

        pronosticos.push(a);

      });


    if (
      pronosticos.length < 3
    ) {

      const existentes =
        new Set(
          pronosticos.map(a =>
            String(a.animal)
              .trim()
              .toUpperCase()
          )
        );


      for (
        const candidato
        of candidatosNuevos
      ) {

        if (
          pronosticos.length >= 3
        ) {

          break;

        }


        const nombre =
          String(candidato.animal)
            .trim()
            .toUpperCase();


        if (
          existentes.has(nombre)
        ) {

          continue;

        }


        pronosticos.push(
          candidato
        );


        existentes.add(
          nombre
        );

      }

    }


    // ==========================================
    // SEGURIDAD
    // ==========================================

    pronosticos =
      pronosticos.slice(0, 3);


    // ==========================================
    // MARCAR PRONÓSTICOS
    // ==========================================

    analisis.forEach(a => {

      a.pronostico = false;

    });


    pronosticos.forEach(a => {

      a.pronostico = true;

      a.categoria =
        "PRONÓSTICO";

    });


    // ==========================================
    // DIAGNÓSTICO
    // ==========================================

    console.log(
      "PRONÓSTICOS XTREME:",
      pronosticos.map(a => ({

        numero:
          a.numero,

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
          a.categoria,

        salioHoy:
          a.salioHoy,

        horariosHoy:
          a.horariosHoy

      }))
    );


    // ==========================================
    // COMPATIBILIDAD
    // ==========================================

    const pronostico =
      pronosticos[0] ||
      null;


    // ==========================================
    // MAYOR ATRASO
    // ==========================================

    const mayorAtraso =
      todosAtrasados.length > 0
        ? todosAtrasados[0]
        : null;


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

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
        candidatosBase.length,

      pronosticosHoy:
        pronosticos.length,

      pronosticoActual:
        pronosticos.length > 0
          ? pronosticos
              .map(a =>
                a.animal
              )
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

        candidatosPronostico:
          candidatosBase.length,

        pronosticosHoy:
          pronosticos.length,

        totalAtrasados:
          totalAtrasados,

        pronosticosPendientes:
          pendientes
            .slice(0, 3)
            .map(a =>
              a.animal
            ),

        candidatosNuevos:
          candidatosNuevos
            .slice(0, 10)
            .map(a =>
              a.animal
            )

      },


      // ========================================
      // 3 PRONÓSTICOS ACTIVOS
      // ========================================

      pronosticos,


      // Compatibilidad anterior

      pronostico,


      // ========================================
      // TOP 10
      // ========================================

      top10,


      // ========================================
      // ATRASADOS
      // ========================================

      atrasados,


      // ========================================
      // ESTADÍSTICAS
      // ========================================

      estadisticas,

      
      // ========================================
      // RESULTADOS DEL DÍA POR ANIMAL
      // ========================================

      resultadosHoy: resultadosHoyPorAnimal

    });


  } catch (error) {

    console.error(
      "ERROR EN /api/analizar:",
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
