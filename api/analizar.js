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

        return b.salidas30 - a.salidas30;

      })
      .slice(0, 10);


    // ==========================================
    // ANIMALES ATRASADOS
    // ==========================================

    const atrasados = analisis
      .filter(a => a.diasSinSalir >= 1)
      .slice()
      .sort((a, b) => {

        // MÁS DÍAS SIN SALIR
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        // MAYOR ÍNDICE
        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        // MENOS ACTIVIDAD RECIENTE
        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        return a.salidas30 - b.salidas30;

      })
      .slice(0, 10);


    // ==========================================
    // CANDIDATOS PARA PRONÓSTICO
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 3)
      .slice()
      .sort((a, b) => {

        // 1. MAYOR ATRASO
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        // 2. MAYOR ÍNDICE
        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        // 3. MENOS ACTIVIDAD RECIENTE
        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        return a.salidas30 - b.salidas30;

      });


    // ==========================================
    // SI HAY POCOS CON 3+ DÍAS
    // BAJAMOS A 2 DÍAS
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
    // SI TODAVÍA HAY POCOS
    // EXCLUIR LOS QUE SALIERON HOY
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
    // PRONÓSTICO ACTUAL
    // ==========================================

    let pronostico = candidatos[0] || null;


    // ==========================================
    // PROTECCIÓN CONTRA REPETICIÓN
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

      const siguiente = candidatos.find(
        a => a.animal !== anterior
      );

      if (siguiente) {
        pronostico = siguiente;
      }

    }


    // ==========================================
    // FECHAS ACTUALES
    // ==========================================

    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .map(r => String(r).substring(0, 10))
      .sort();


    const fechaMasAntigua =
      fechas[0] || null;


    const fechaMasReciente =
      fechas[fechas.length - 1] || null;


    const fechasUnicas = [
      ...new Set(fechas)
    ].sort();


    // ==========================================
    // ESTADÍSTICA ACTUAL
    // ==========================================

    const mayorAtraso =
      atrasados.length > 0
        ? atrasados[0]
        : null;


    const estadisticas = {

      // LA LISTA OFICIAL TIENE 77
      totalAnimales: 77,

      // HISTORIAL REAL DE SUPABASE
      totalHistorial: historial.length,

      // ANIMAL CON MAYOR ATRASO ACTUAL
      mayorAtraso:
        mayorAtraso
          ? mayorAtraso.animal
          : null,

      // DÍAS REALES DEL MAYOR ATRASO
      diasMayorAtraso:
        mayorAtraso
          ? mayorAtraso.diasSinSalir
          : 0,

      // CANTIDAD REAL DE CANDIDATOS
      candidatosPronostico:
        candidatos.length,

      // PRONÓSTICO ACTUAL
      pronosticoActual:
        pronostico
          ? pronostico.animal
          : null,

      // DÍAS DEL PRONÓSTICO
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

      historial: historial.length,

      DIAGNOSTICO: {

        fechaMasAntigua,

        fechaMasReciente,

        cantidadFechasDiferentes:
          fechasUnicas.length,

        primeras5Fechas:
          fechasUnicas.slice(0, 5),

        ultimas5Fechas:
          fechasUnicas.slice(-5),

        candidatosPronostico:
          candidatos.length

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
