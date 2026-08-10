import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";

export default async function handler(req, res) {

  try {

    /*
    ==========================================
    OBTENER HISTORIAL
    ==========================================
    */

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) throw error;


    /*
    ==========================================
    ANALIZAR RESULTADOS
    ==========================================
    */

    const analisis = analizarResultados(historial);


    /*
    ==========================================
    TOP 10
    ==========================================
    */

    const top10 = analisis
      .slice()
      .sort((a, b) => {

        if (b.indice !== a.indice) {
          return b.indice - a.indice;
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


    /*
    ==========================================
    ANIMALES ATRASADOS
    ==========================================
    */

    const atrasados = analisis
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

        return b.salidas - a.salidas;

      })
      .slice(0, 10);


    /*
    ==========================================
    PRONÓSTICO DEL DÍA
    ==========================================

    IMPORTANTE:

    El animal #1 del TOP 10 NO será
    automáticamente el pronóstico.

    Si un animal domina demasiado,
    buscamos el siguiente candidato fuerte.

    Esto evita que el mismo animal quede
    permanentemente clavado en pronóstico.
    ==========================================
    */

    let pronostico = top10[0] || null;


    /*
    ==========================================
    ROTACIÓN DEL PRONÓSTICO
    ==========================================

    Si existe un parámetro "anterior",
    se puede indicar el animal que fue
    pronóstico anteriormente.

    Ejemplo:

    /api/analizar?anterior=BÚFALO

    En ese caso BÚFALO puede continuar
    en TOP 10, pero el pronóstico buscará
    el siguiente candidato.
    ==========================================
    */

    const anterior =
      req.query &&
      req.query.anterior
        ? String(req.query.anterior)
            .trim()
            .toUpperCase()
        : null;


    if (anterior) {

      const siguiente =
        top10.find(
          a =>
            a.animal !== anterior
        );

      if (siguiente) {

        pronostico = siguiente;

      }

    }


    /*
    ==========================================
    DIAGNÓSTICO DE FECHAS
    ==========================================
    */

    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .sort();


    const fechaMasAntigua =
      fechas[0] || null;


    const fechaMasReciente =
      fechas[fechas.length - 1] || null;


    const fechasUnicas = [
      ...new Set(
        historial
          .map(r =>
            r.fecha
              ? String(r.fecha)
                  .substring(0, 10)
              : null
          )
          .filter(Boolean)
      )
    ].sort();


    /*
    ==========================================
    RESPUESTA
    ==========================================
    */

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
          fechasUnicas.slice(-5)

      },

      pronostico,

      top10,

      atrasados

    });


  } catch (error) {

    return res.status(500).json({

      ok: false,

      error: error.message

    });

  }

}
