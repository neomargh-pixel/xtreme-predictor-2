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
    TOP 10 XTREME
    ==========================================
    */

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


    /*
    ==========================================
    ANIMALES ATRASADOS
    ==========================================
    */

    const atrasados = analisis
      .slice()
      .sort((a, b) => {

        if (b.diasSinSalir !== a.diasSinSalir) {

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
    PRONÓSTICO XTREME
    ==========================================

    AQUÍ ESTÁ EL CAMBIO IMPORTANTE.

    EL PRONÓSTICO YA NO SALE DEL TOP 10.

    BUSCAMOS PRIMERO LOS ANIMALES QUE
    LLEVAN TIEMPO SIN SALIR.

    MÍNIMO: 7 DÍAS.

    Así un animal que salió hace 1, 2 o 3 días
    no puede dominar el pronóstico solamente
    porque tenga muchas salidas históricas.
    ==========================================
    */

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 7)
      .sort((a, b) => {

        /*
        PRIMERO:
        MÁS DÍAS SIN SALIR
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
        SEGUNDO:
        MAYOR ÍNDICE
        */

        if (b.indice !== a.indice) {

          return (
            b.indice -
            a.indice
          );

        }


        /*
        TERCERO:
        ACTIVIDAD RECIENTE
        */

        if (b.salidas14 !== a.salidas14) {

          return (
            b.salidas14 -
            a.salidas14
          );

        }


        return b.salidas - a.salidas;

      });


    /*
    ==========================================
    SI NO HAY ANIMALES CON 7+ DÍAS
    ==========================================

    Usamos los más atrasados disponibles.
    ==========================================
    */

    if (candidatos.length === 0) {

      candidatos = analisis
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
    ROTACIÓN DIARIA
    ==========================================

    NO QUEREMOS QUE EL MISMO ANIMAL APAREZCA
    COMO PRONÓSTICO TODOS LOS DÍAS.

    Usamos el día calendario para movernos
    entre los candidatos atrasados.

    Ejemplo:

    Día 1 → Guacamaya
    Día 2 → Alacrán
    Día 3 → Chigüire
    Día 4 → Gavilán
    etc.

    Cuando termina la lista vuelve a empezar.

    Esto hace que el sistema VARÍE.
    ==========================================
    */

    let pronostico = candidatos[0] || null;


    if (candidatos.length > 1) {

      const fechaReferencia =
        historial
          .map(r => r.fecha)
          .filter(Boolean)
          .sort()
          .pop();


      if (fechaReferencia) {

        const fecha =
          new Date(
            `${String(fechaReferencia).substring(0, 10)}T00:00:00Z`
          );


        const inicio =
          new Date("2026-01-01T00:00:00Z");


        const diasDesdeInicio =
          Math.floor(
            (
              fecha.getTime() -
              inicio.getTime()
            ) / 86400000
          );


        const posicion =
          Math.abs(diasDesdeInicio) %
          candidatos.length;


        pronostico =
          candidatos[posicion];

      }

    }


    /*
    ==========================================
    PERMITIR SELECCIÓN MANUAL DE ANTERIOR
    ==========================================

    Si se envía:

    /api/analizar?anterior=BÚFALO

    se evita ese animal y se busca otro.

    Esto sirve como protección adicional.
    ==========================================
    */

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
          a =>
            a.animal !== anterior
        );

      if (siguiente) {

        pronostico =
          siguiente;

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
