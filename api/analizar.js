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
        atrasados: []
      });
    }


    // ==========================================
    // ANALIZAR LOS 77 ANIMALITOS
    // ==========================================

    const analisis = analizarResultados(historial);


    // ==========================================
    // TOP 10
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
    // ATRASADOS
    // ==========================================

    const atrasados = analisis
      .slice()
      .sort((a, b) => {

        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        return b.salidas - a.salidas;

      })
      .slice(0, 10);


    // ==========================================
    // FECHA DE REFERENCIA
    // ==========================================

    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .map(r => String(r).substring(0, 10))
      .sort();

    const fechaReferencia =
      fechas[fechas.length - 1] || null;


    // ==========================================
    // PRONÓSTICO XTREME
    //
    // IMPORTANTE:
    //
    // NO usamos el TOP 10.
    //
    // NO buscamos al que más ha salido.
    //
    // Buscamos animales ATRASADOS.
    //
    // Se consideran primero los que tienen
    // 3 o más días sin salir.
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 3)
      .slice()
      .sort((a, b) => {

        // 1. Mayor atraso
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        // 2. Mayor índice
        if (b.indice !== a.indice) {
          return b.indice - a.indice;
        }

        // 3. Menor actividad reciente
        if (a.salidas7 !== b.salidas7) {
          return a.salidas7 - b.salidas7;
        }

        if (a.salidas14 !== b.salidas14) {
          return a.salidas14 - b.salidas14;
        }

        return a.salidas30 - b.salidas30;

      });


    // ==========================================
    // SI HAY MUY POCOS ATRASADOS
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
    // SI TODAVÍA SON POCOS
    // USAMOS TODOS EXCEPTO LOS QUE SALIERON
    // HOY
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
    // ROTACIÓN
    //
    // El mismo animal NO queda clavado.
    //
    // Usamos la fecha para avanzar dentro
    // de los candidatos.
    // ==========================================

    let pronostico = candidatos[0] || null;

    if (candidatos.length > 1 && fechaReferencia) {

      const fecha =
        new Date(`${fechaReferencia}T00:00:00Z`);

      const inicio =
        new Date("2026-01-01T00:00:00Z");

      const diasDesdeInicio =
        Math.floor(
          (fecha.getTime() - inicio.getTime()) /
          86400000
        );

      const posicion =
        diasDesdeInicio % candidatos.length;

      pronostico =
        candidatos[posicion];

    }


    // ==========================================
    // PROTECCIÓN CONTRA ANIMAL ANTERIOR
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
    // DIAGNÓSTICO
    // ==========================================

    const fechasUnicas = [
      ...new Set(
        historial
          .map(r =>
            r.fecha
              ? String(r.fecha).substring(0, 10)
              : null
          )
          .filter(Boolean)
      )
    ].sort();


    // ==========================================
    // RESPUESTA
    // ==========================================

    return res.status(200).json({

      ok: true,

      historial: historial.length,

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

      atrasados

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      ok: false,

      error: error.message

    });

  }

}
