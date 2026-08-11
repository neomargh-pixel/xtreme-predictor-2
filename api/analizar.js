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
    ANALIZAR
    ==========================================
    */

    const analisis = analizarResultados(historial);

    if (!Array.isArray(analisis) || analisis.length === 0) {

      return res.status(200).json({
        ok: true,
        historial: historial.length,
        pronostico: null,
        top10: [],
        atrasados: []
      });

    }


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
    CONJUNTO DE ANIMALES DEL TOP 10
    ==========================================
    */

    const nombresTop10 = new Set(
      top10.map(a => a.animal)
    );


    /*
    ==========================================
    ATRASADOS
    ==========================================
    */

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


    /*
    ==========================================
    PRONÓSTICO
    ==========================================

    MUY IMPORTANTE:

    AQUÍ NO USAMOS EL TOP 10.

    Se eliminan completamente los animales
    que estén dentro del TOP 10.

    El pronóstico sale del resto de animales.
    ==========================================
    */

    let candidatos = analisis
      .filter(a => !nombresTop10.has(a.animal));


    /*
    ==========================================
    PRIORIZAR ATRASADOS
    ==========================================

    Preferimos animales que tengan:

    1. Muchos días sin salir
    2. Algún historial de salidas
    3. Actividad reciente moderada

    No buscamos simplemente el que más salió.
    ==========================================
    */

    candidatos.sort((a, b) => {

      /*
      PRIMERO:
      DÍAS SIN SALIR
      */

      if (b.diasSinSalir !== a.diasSinSalir) {
        return b.diasSinSalir - a.diasSinSalir;
      }


      /*
      SEGUNDO:
      ÍNDICE
      */

      if (b.indice !== a.indice) {
        return b.indice - a.indice;
      }


      /*
      TERCERO:
      HISTORIAL
      */

      if (b.salidas30 !== a.salidas30) {
        return b.salidas30 - a.salidas30;
      }


      return b.salidas - a.salidas;

    });


    /*
    ==========================================
    SOLO ANIMALES REALMENTE ATRASADOS
    ==========================================
    */

    let atrasadosParaPronostico =
      candidatos.filter(
        a => a.diasSinSalir >= 5
      );


    /*
    Si hay menos candidatos con 5+ días,
    usamos los más atrasados disponibles.
    */

    if (atrasadosParaPronostico.length === 0) {

      atrasadosParaPronostico =
        candidatos.slice();

    }


    /*
    ==========================================
    FECHA DE REFERENCIA
    ==========================================
    */

    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .sort();


    const fechaReferencia =
      fechas.length
        ? String(fechas[fechas.length - 1])
            .substring(0, 10)
        : null;


    /*
    ==========================================
    PRONÓSTICO ESTABLE POR DÍA
    ==========================================

    IMPORTANTE:

    Al actualizar la página varias veces
    durante el mismo día NO cambia.

    Cambiará únicamente cuando cambie
    la fecha de referencia.
    ==========================================
    */

    let pronostico = null;


    if (atrasadosParaPronostico.length > 0) {

      /*
      Creamos una posición basada en la fecha.
      */

      const fechaBase =
        new Date(
          `${fechaReferencia}T00:00:00Z`
        );

      const inicio =
        new Date("2026-01-01T00:00:00Z");


      const dias =
        Math.floor(
          (
            fechaBase.getTime() -
            inicio.getTime()
          ) / 86400000
        );


      /*
      No usamos simplemente el primero.

      Rotamos entre los candidatos
      atrasados EXCLUYENDO el TOP 10.
      */

      const posicion =
        Math.abs(dias) %
        atrasadosParaPronostico.length;


      pronostico =
        atrasadosParaPronostico[posicion];

    }


    /*
    ==========================================
    PROTECCIÓN EXTRA
    ==========================================
    */

    if (
      pronostico &&
      nombresTop10.has(pronostico.animal)
    ) {

      pronostico =
        atrasadosParaPronostico.find(
          a => !nombresTop10.has(a.animal)
        ) || null;

    }


    /*
    ==========================================
    DIAGNÓSTICO
    ==========================================
    */

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


    /*
    ==========================================
    RESPUESTA
    ==========================================
    */

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
          atrasadosParaPronostico
            .map(a => a.animal)

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
