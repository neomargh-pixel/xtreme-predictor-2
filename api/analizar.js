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
    // ANALIZAR HISTORIAL
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
    //
    // 7 O MÁS DÍAS SIN SALIR
    // ==========================================

    const todosAtrasados = analisis
      .filter(a => a.diasSinSalir >= 7)
      .slice()
      .sort((a, b) => {

        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        if (a.salidas30 !== b.salidas30) {
          return a.salidas30 - b.salidas30;
        }

        return b.salidas - a.salidas;

      });


    // ==========================================
    // MOSTRAR LOS 10 MAYORES ATRASOS
    // ==========================================

    const atrasados =
      todosAtrasados.slice(0, 10);


    // ==========================================
    // TOTAL REAL DE ATRASADOS
    // ==========================================

    const totalAtrasados =
      todosAtrasados.length;


    // ==========================================
    // HISTORIAL DE PRONÓSTICOS RECIENTES
    // ==========================================

    let recientes = [];


    if (
      req.query &&
      req.query.recientes
    ) {

      recientes =
        String(req.query.recientes)
          .split(",")
          .map(a =>
            String(a)
              .trim()
              .toUpperCase()
          )
          .filter(Boolean);

    }


    // ==========================================
    // CANDIDATOS PARA PRONÓSTICO
    //
    // NO SON RESULTADOS GARANTIZADOS.
    // SON POSIBILIDADES ESTADÍSTICAS.
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 2)
      .slice()
      .sort((a, b) => {

        // Primero: mejor índice
        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        // Segundo: mayor atraso
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        // Tercero: menor actividad reciente
        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        if (a.salidas30 !== b.salidas30) {
          return a.salidas30 - b.salidas30;
        }

        return b.salidas - a.salidas;

      });


    // ==========================================
    // EVITAR REPETIR PRONÓSTICOS RECIENTES
    // ==========================================

    const candidatosNuevos =
      candidatos.filter(a =>
        !recientes.includes(
          String(a.animal)
            .trim()
            .toUpperCase()
        )
      );


    // Si hay al menos 3 candidatos nuevos,
    // usamos los nuevos.

    if (candidatosNuevos.length >= 3) {
      candidatos = candidatosNuevos;
    }


    // ==========================================
    // LOS 3 PRONÓSTICOS DEL DÍA
    // ==========================================

    const pronosticos =
      candidatos.slice(0, 3);


    // ==========================================
    // DIAGNÓSTICO EN CONSOLA
    // ==========================================

    console.log(
      "PRONÓSTICOS XTREME:",
      pronosticos.map(a => ({
        animal: a.animal,
        indice: a.indice,
        porcentaje: a.porcentaje,
        diasSinSalir: a.diasSinSalir,
        salidas7: a.salidas7,
        salidas14: a.salidas14,
        salidas30: a.salidas30,
        tendencia: a.tendencia,
        categoria: a.categoria
      }))
    );


    // ==========================================
    // COMPATIBILIDAD
    //
    // El primer animal también queda
    // disponible como "pronostico".
    // ==========================================

    const pronostico =
      pronosticos[0] || null;


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

      totalAnimales: 77,

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
      // 3 POSIBILIDADES DEL DÍA
      // ========================================

      pronosticos,

      // Compatibilidad con código anterior
      pronostico,

      // ========================================
      // TOP 10
      // ========================================

      top10,

      // ========================================
      // ANIMALES ATRASADOS
      // ========================================

      atrasados,

      // ========================================
      // ESTADÍSTICAS
      // ========================================

      estadisticas

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
