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

    const analisis =
      analizarResultados(historial);


    /*
    ==========================================
    TOP 10
    ==========================================
    */

    const top10 =
      analisis
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


    /*
    ==========================================
    ANIMALES ATRASADOS
    ==========================================
    */

    const atrasados =
      analisis
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

          if (b.indice !== a.indice) {

            return (
              b.indice -
              a.indice
            );

          }

          return b.salidas - a.salidas;

        })
        .slice(0, 10);


    /*
    ==========================================
    CANDIDATOS AL PRONÓSTICO
    ==========================================

    EL PRONÓSTICO DEBE BUSCAR ANIMALES
    ATRASADOS.

    NO QUEREMOS QUE UN ANIMAL QUE ACABA
    DE SALIR DOMINE EL PRONÓSTICO.
    ==========================================
    */

    let candidatos =
      analisis
        .filter(a =>
          a.diasSinSalir >= 7
        )
        .sort((a, b) => {

          /*
          MÁS ATRASADO PRIMERO
          */

          if (
            b.diasSinSalir !==
            a.diasSinSalir
          ) {

            return (
              b.diasSinSalir -
              a.diasSinSalir
            );

          }


          /*
          LUEGO ÍNDICE
          */

          if (b.indice !== a.indice) {

            return (
              b.indice -
              a.indice
            );

          }


          /*
          LUEGO ACTIVIDAD
          */

          if (
            b.salidas14 !==
            a.salidas14
          ) {

            return (
              b.salidas14 -
              a.salidas14
            );

          }


          return b.salidas - a.salidas;

        });


    /*
    ==========================================
    SI NO HAY 7+ DÍAS
    ==========================================
    */

    if (candidatos.length === 0) {

      candidatos =
        analisis
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

    }


    /*
    ==========================================
    HISTORIAL DE PRONÓSTICOS DEL NAVEGADOR
    ==========================================

    El index.html enviará:

    anterior=GUACAMAYA
    recientes=GUACAMAYA,CHIGUIRE,...

    Así evitamos que el sistema alterne
    únicamente entre dos animales.
    ==========================================
    */

    const anterior =
      req.query &&
      req.query.anterior
        ? String(req.query.anterior)
            .trim()
            .toUpperCase()
        : null;


    let recientes = [];


    if (
      req.query &&
      req.query.recientes
    ) {

      recientes =
        String(req.query.recientes)
          .split(",")
          .map(a =>
            a.trim().toUpperCase()
          )
          .filter(Boolean);

    }


    /*
    ==========================================
    EXCLUSIONES
    ==========================================
    */

    const excluidos =
      new Set([
        ...recientes,
        ...(anterior ? [anterior] : [])
      ]);


    /*
    ==========================================
    BUSCAR CANDIDATO NUEVO
    ==========================================
    */

    let pronostico =
      candidatos.find(
        a =>
          !excluidos.has(
            a.animal
          )
      );


    /*
    ==========================================
    SI TODOS ESTÁN EXCLUIDOS
    ==========================================

    No dejamos el pronóstico vacío.

    En ese caso utilizamos el candidato
    más fuerte disponible.
    ==========================================
    */

    if (!pronostico) {

      pronostico =
        candidatos[0] ||
        analisis[0] ||
        null;

    }


    /*
    ==========================================
    RESPUESTA
    ==========================================
    */

    const fechas =
      historial
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


    return res.status(200).json({

      ok: true,

      historial:
        historial.length,

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
