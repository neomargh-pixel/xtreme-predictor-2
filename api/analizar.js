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
        pronostico: null,
        top10: [],
        atrasados: [],
        estadisticas: {}
      });

    }


    // ==========================================
    // ANALIZAR
    // ==========================================

    const analisis = analizarResultados(historial);


    // ==========================================
    // TOP 10 REAL
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
    // ATRASADOS REAL
    // ==========================================

    const atrasados = analisis
      .filter(a => a.diasSinSalir >= 1)
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

      })
      .slice(0, 10);


    // ==========================================
    // CANDIDATOS DEL PRONÓSTICO
    //
    // IMPORTANTE:
    // NO usamos TOP 10 directamente.
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 2)
      .slice()
      .sort((a, b) => {

        // Primero atraso
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        // Después índice
        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        // Menos actividad reciente
        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        return a.salidas30 - b.salidas30;

      });


    // ==========================================
    // SI HAY POCOS
    // ==========================================

    if (candidatos.length < 8) {

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
    //
    // ROTACIÓN POR BLOQUES DE TIEMPO
    //
    // Esto es SOLO para el pronóstico.
    // NO modifica TOP 10, ATRASADOS
    // ni las estadísticas.
    // ==========================================

    let pronostico = candidatos[0] || null;

    if (candidatos.length > 1) {

      const ahora = new Date();

      /*
      Un bloque = 5 minutos.

      Cada bloque puede seleccionar
      un candidato diferente.
      */

      const bloque =
        Math.floor(
          ahora.getTime() / (5 * 60 * 1000)
        );

      const posicion =
        bloque % candidatos.length;

      pronostico =
        candidatos[posicion];

    }


    // ==========================================
    // PROTECCIÓN CONTRA ANTERIOR
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

      const posicionActual =
        candidatos.findIndex(
          a => a.animal === anterior
        );

      if (posicionActual >= 0) {

        const siguiente =
          candidatos[
            (posicionActual + 1) %
            candidatos.length
          ];

        if (siguiente) {
          pronostico = siguiente;
        }

      }

    }


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
    // ESTADÍSTICAS REALES
    // ==========================================

    const mayorAtraso =
      atrasados.length > 0
        ? atrasados[0]
        : null;


    const estadisticas = {

  totalAnimales: 77,

  totalHistorial: historial.length,

  mayorAtraso:
    atrasados.length > 0
      ? atrasados[0].animal
      : null,

  diasMayorAtraso:
    atrasados.length > 0
      ? atrasados[0].diasSinSalir
      : 0,

  candidatosPronostico:
    candidatos.length,

  fechaActual:
    fechaReferencia,

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
    // RESPUESTA
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
