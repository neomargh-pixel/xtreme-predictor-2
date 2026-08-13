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

    if (!Array.isArray(historial) || historial.length === 0) {

      return res.status(200).json({
        ok: true,
        historial: 0,
        DIAGNOSTICO: {
          totalAnimales: 77,
          totalAtrasados: 0
        },
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

    const analisis = analizarResultados(historial);


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
    //
    // SOLO SE CONSIDERA ATRASADO:
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
    // LISTA QUE SE MUESTRA EN LA PÁGINA
    // ==========================================

    const atrasados =
      todosAtrasados.slice(0, 10);


    // ==========================================
    // TOTAL REAL DE ATRASADOS
    // ==========================================

    const totalAtrasados =
      todosAtrasados.length;


    // ==========================================
    // CANDIDATOS PARA PRONÓSTICO
    //
    // PRIORIDAD:
    // 1. 3+ DÍAS
    // 2. MAYOR ATRASO
    // 3. ÍNDICE
    // 4. MENOR ACTIVIDAD RECIENTE
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 3)
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
    // SI HAY MENOS DE 5
    // BAJAR A 2 DÍAS
    // ==========================================

    if (candidatos.length < 5) {

      candidatos = analisis
        .filter(a => a.diasSinSalir >= 2)
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

          return a.salidas14 - b.salidas14;

        });

    }


    // ==========================================
    // SI TODAVÍA HAY MENOS DE 5
    // BAJAR A 1 DÍA
    // ==========================================

    if (candidatos.length < 5) {

      candidatos = analisis
        .filter(a => a.diasSinSalir >= 1)
        .slice()
        .sort((a, b) => {

          if (b.diasSinSalir !== a.diasSinSalir) {
            return b.diasSinSalir - a.diasSinSalir;
          }

          if (b.indice !== a.indice) {
            return b.indice - a.indice;
          }

          return a.salidas7 - b.salidas7;

        });

    }


    // ==========================================
    // PRONÓSTICO
    // ==========================================

    let pronostico =
      candidatos[0] || null;


    // ==========================================
    // EVITAR REPETIR EL ANTERIOR
    // ==========================================

    const anterior =
      req.query &&
      req.query.anterior
        ? String(req.query.anterior)
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
          a => a.animal !== anterior
        );

      if (siguiente) {
        pronostico = siguiente;
      }

    }


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    const mayorAtraso =
      todosAtrasados.length > 0
        ? todosAtrasados[0]
        : null;


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

      pronosticoActual:
        pronostico
          ? pronostico.animal
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

        totalAtrasados:
          totalAtrasados

      },

      pronostico,

      top10,

      atrasados,

      estadisticas

    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({

      ok: false,

      error: error.message

    });

  }

}
