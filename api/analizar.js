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
    // LEER PRONÓSTICOS ANTERIORES
    // GUARDADOS EN COOKIE
    // ==========================================

    let anteriores = [];

    const cookies = req.headers.cookie || "";

    const coincidencia =
      cookies.match(/xtreme_pronosticos=([^;]+)/);

    if (coincidencia) {

      try {

        anteriores =
          JSON.parse(
            decodeURIComponent(
              coincidencia[1]
            )
          );

        if (!Array.isArray(anteriores)) {
          anteriores = [];
        }

      } catch (e) {

        anteriores = [];

      }

    }


    // ==========================================
    // NORMALIZAR NOMBRES
    // ==========================================

    anteriores = anteriores
      .map(a =>
        String(a)
          .trim()
          .toUpperCase()
      )
      .filter(Boolean);


    // ==========================================
    // PRONÓSTICO
    //
    // PRIORIDAD:
    //
    // 1. ANIMALES CON MÁS DÍAS SIN SALIR
    // 2. MAYOR ÍNDICE
    // 3. MENOR ACTIVIDAD RECIENTE
    //
    // PERO SE EXCLUYEN LOS ANIMALES
    // USADOS EN LOS ÚLTIMOS PRONÓSTICOS.
    // ==========================================

    let candidatos = analisis
      .filter(a => a.diasSinSalir >= 3)
      .slice()
      .sort((a, b) => {

        // MÁS DÍAS SIN SALIR
        if (
          b.diasSinSalir !==
          a.diasSinSalir
        ) {

          return (
            b.diasSinSalir -
            a.diasSinSalir
          );

        }

        // MAYOR ÍNDICE
        if (b.indice !== a.indice) {

          return (
            b.indice -
            a.indice
          );

        }

        // MENOS ACTIVIDAD RECIENTE
        if (a.salidas7 !== b.salidas7) {

          return (
            a.salidas7 -
            b.salidas7
          );

        }

        if (a.salidas14 !== b.salidas14) {

          return (
            a.salidas14 -
            b.salidas14
          );

        }

        return a.salidas30 - b.salidas30;

      });


    // ==========================================
    // SI HAY MENOS DE 5 ATRASADOS
    // BAJAMOS A 2 DÍAS
    // ==========================================

    if (candidatos.length < 5) {

      candidatos = analisis
        .filter(a => a.diasSinSalir >= 2)
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

          return a.salidas7 - b.salidas7;

        });

    }


    // ==========================================
    // SI TODAVÍA HAY POCOS
    // USAMOS TODOS LOS QUE NO SALIERON HOY
    // ==========================================

    if (candidatos.length < 5) {

      candidatos = analisis
        .filter(a => a.diasSinSalir >= 1)
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

          return a.salidas7 - b.salidas7;

        });

    }


    // ==========================================
    // QUITAR LOS ÚLTIMOS PRONÓSTICOS
    //
    // ESTO ES LO QUE EVITA:
    //
    // GALLINA
    // GUACAMAYA
    // GALLINA
    // GUACAMAYA
    //
    // ==========================================

    let disponibles = candidatos.filter(
      a =>
        !anteriores.includes(
          a.animal
        )
    );


    // ==========================================
    // SI TODOS ESTÁN BLOQUEADOS
    //
    // QUITAMOS SOLAMENTE EL MÁS ANTIGUO
    // DE LA MEMORIA PARA PODER CONTINUAR.
    // ==========================================

    if (disponibles.length === 0) {

      if (anteriores.length > 0) {

        const desbloquear =
          anteriores[0];

        anteriores =
          anteriores.filter(
            a =>
              a !== desbloquear
          );

      }

      disponibles =
        candidatos.filter(
          a =>
            !anteriores.includes(
              a.animal
            )
        );

    }


    // ==========================================
    // ELEGIR PRONÓSTICO
    //
    // EL PRIMERO ES EL MÁS ATRASADO
    // DISPONIBLE.
    // ==========================================

    let pronostico =
      disponibles[0] ||
      candidatos[0] ||
      analisis[0] ||
      null;


    // ==========================================
    // PROTECCIÓN EXTRA: ANTERIOR
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
        disponibles.find(
          a =>
            a.animal !== anterior
        );

      if (siguiente) {

        pronostico = siguiente;

      }

    }


    // ==========================================
    // GUARDAR EL NUEVO PRONÓSTICO
    // ==========================================

    if (pronostico) {

      anteriores.push(
        pronostico.animal
      );

    }


    // ==========================================
    // MANTENER SOLAMENTE LOS ÚLTIMOS 10
    // ==========================================

    anteriores =
      [...new Set(anteriores)]
      .slice(-10);


    // ==========================================
    // GUARDAR COOKIE
    // ==========================================

    res.setHeader(
      "Set-Cookie",
      `xtreme_pronosticos=${encodeURIComponent(
        JSON.stringify(anteriores)
      )}; Path=/; Max-Age=2592000; SameSite=Lax`
    );


    // ==========================================
    // DIAGNÓSTICO DE FECHAS
    // ==========================================

    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .map(r =>
        String(r).substring(0, 10)
      )
      .sort();


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
          candidatos.length,

        candidatosDisponibles:
          disponibles.length,

        memoriaPronosticos:
          anteriores

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
