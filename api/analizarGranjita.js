import supabase from "../lib/supabase.js";


function obtenerHoyCaracas() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());

}


function obtenerFechaResultado(fecha) {

  if (!fecha) return null;

  const texto = String(fecha).trim();

  const match = texto.match(
    /^(\d{4}-\d{2}-\d{2})/
  );

  return match ? match[1] : null;

}


function obtenerHoraCaracas(fecha) {

  if (!fecha) return null;

  const texto = String(fecha).trim();

  const match = texto.match(
    /(?:T|\s)(\d{1,2}):(\d{2})(?::\d{2})?/
  );

  if (!match) return null;

  let hora = parseInt(match[1], 10);

  const minutos = match[2];

  const periodo =
    hora >= 12 ? "p. m." : "a. m.";

  if (hora === 0) {
    hora = 12;
  }

  else if (hora > 12) {
    hora -= 12;
  }

  return `${String(hora).padStart(2, "0")}:${minutos} ${periodo}`;

}


async function obtenerTodoHistorial() {

  const resultados = [];

  const bloque = 1000;

  let desde = 0;

  while (true) {

    const hasta =
      desde + bloque - 1;

    const {
      data,
      error
    } =
      await supabase
        .from("historial_granjita")
        .select("*")
        .order("fecha", {
          ascending: false
        })
        .range(
          desde,
          hasta
        );

    if (error) {
      throw error;
    }

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      break;
    }

    resultados.push(...data);

    if (data.length < bloque) {
      break;
    }

    desde += bloque;

  }

  return resultados;

}


function analizar(historial) {

  const hoy =
    obtenerHoyCaracas();

  const animales = {};

  historial.forEach(r => {

    if (
      !r.animal ||
      !r.fecha
    ) {
      return;
    }

    const animal =
      String(r.animal)
        .trim()
        .toUpperCase();

    const fecha =
      obtenerFechaResultado(
        r.fecha
      );

    if (!fecha) return;

    if (!animales[animal]) {

      animales[animal] = {

        animal,

        numero: r.numero,

        salidas: 0,

        fechas: []

      };

    }

    animales[animal].salidas++;

    animales[animal].fechas.push(
      fecha
    );

  });


  const lista =
    Object.values(animales);


  lista.forEach(a => {

    const fechasUnicas =
      [...new Set(a.fechas)]
        .sort();

    a.fechas =
      fechasUnicas;

    a.ultimaFecha =
      fechasUnicas[
        fechasUnicas.length - 1
      ] || null;


    if (!a.ultimaFecha) {

      a.diasSinSalir = 999;

    }

    else {

      const ultima =
        new Date(
          `${a.ultimaFecha}T00:00:00`
        );

      const actual =
        new Date(
          `${hoy}T00:00:00`
        );

      a.diasSinSalir =
        Math.max(
          0,
          Math.floor(
            (
              actual - ultima
            ) /
            86400000
          )
        );

    }


    const hace7 =
      new Date(
        `${hoy}T00:00:00`
      );

    hace7.setDate(
      hace7.getDate() - 7
    );


    const hace14 =
      new Date(
        `${hoy}T00:00:00`
      );

    hace14.setDate(
      hace14.getDate() - 14
    );


    const hace30 =
      new Date(
        `${hoy}T00:00:00`
      );

    hace30.setDate(
      hace30.getDate() - 30
    );


    a.salidas7 =
      a.fechas.filter(
        f =>
          new Date(
            `${f}T00:00:00`
          ) >= hace7
      ).length;


    a.salidas14 =
      a.fechas.filter(
        f =>
          new Date(
            `${f}T00:00:00`
          ) >= hace14
      ).length;


    a.salidas30 =
      a.fechas.filter(
        f =>
          new Date(
            `${f}T00:00:00`
          ) >= hace30
      ).length;


    /*
    ========================================
    ÍNDICE XTREME
    ========================================
    */

    a.indice =
      (
        a.salidas7 * 5 +
        a.salidas14 * 3 +
        a.salidas30 * 2 +
        a.diasSinSalir * 2
      );


    if (a.indice >= 80) {

      a.porcentaje = 95;

      a.tendencia =
        "MUY ALTA";

    }

    else if (a.indice >= 60) {

      a.porcentaje = 85;

      a.tendencia =
        "ALTA";

    }

    else if (a.indice >= 40) {

      a.porcentaje = 70;

      a.tendencia =
        "MEDIA";

    }

    else {

      a.porcentaje = 50;

      a.tendencia =
        "NORMAL";

    }

  });


  return lista;

}


export default async function handler(
  req,
  res
) {

  try {

    const historial =
      await obtenerTodoHistorial();


    if (
      !historial.length
    ) {

      return res.status(200).json({

        ok: true,

        loteria:
          "La Granjita",

        historial: 0,

        pronosticos: [],

        pronostico: null,

        top10: [],

        atrasados: [],

        resultadosHoy: {},

        estadisticas: {}

      });

    }


    const analisis =
      analizar(
        historial
      );


    const hoy =
      obtenerHoyCaracas();


    /*
    ========================================
    RESULTADOS DE HOY
    ========================================
    */

    const resultadosHoy = {};


    historial.forEach(r => {

      if (
        obtenerFechaResultado(
          r.fecha
        ) !== hoy
      ) {
        return;
      }

      const animal =
        String(r.animal)
          .trim()
          .toUpperCase();


      if (
        !resultadosHoy[animal]
      ) {

        resultadosHoy[animal] = [];

      }


      resultadosHoy[animal].push({

        hora:
          obtenerHoraCaracas(
            r.fecha
          ),

        fecha:
          r.fecha,

        numero:
          r.numero

      });

    });


    /*
    ========================================
    MARCAR RESULTADOS
    ========================================
    */

    analisis.forEach(a => {

      const resultados =
        resultadosHoy[
          a.animal
        ] || [];

      a.salioHoy =
        resultados.length > 0;

      a.resultadosHoy =
        resultados;

      a.horariosHoy =
        resultados.map(
          r => r.hora
        );

      a.resultadoHoy =
        resultados.length
          ? "SALIO"
          : "NO SALIO";

    });


    /*
    ========================================
    TOP 10
    ========================================
    */

    const top10 =
      analisis
        .slice()
        .sort(
          (a, b) => {

            if (
              b.indice !==
              a.indice
            ) {

              return (
                b.indice -
                a.indice
              );

            }

            if (
              b.diasSinSalir !==
              a.diasSinSalir
            ) {

              return (
                b.diasSinSalir -
                a.diasSinSalir
              );

            }

            return (
              b.salidas -
              a.salidas
            );

          }
        )
        .slice(0, 10);


    /*
    ========================================
    ATRASADOS
    ========================================
    */

    const atrasados =
      analisis
        .filter(
          a =>
            a.diasSinSalir >= 7
        )
        .sort(
          (a, b) =>
            b.diasSinSalir -
            a.diasSinSalir
        )
        .slice(
          0,
          10
        );


    /*
    ========================================
    3 PRONÓSTICOS
    ========================================
    */

    const pronosticos =
      analisis
        .filter(
          a =>
            !a.salioHoy
        )
        .slice()
        .sort(
          (a, b) => {

            if (
              b.indice !==
              a.indice
            ) {

              return (
                b.indice -
                a.indice
              );

            }

            return (
              b.salidas30 -
              a.salidas30
            );

          }
        )
        .slice(
          0,
          3
        );


    /*
    ========================================
    MARCAR PRONÓSTICOS
    ========================================
    */

    analisis.forEach(a => {

      a.pronostico = false;

    });


    pronosticos.forEach(a => {

      a.pronostico = true;

      a.categoria =
        "PRONÓSTICO";

    });


    const pronostico =
      pronosticos[0] ||
      null;


    /*
    ========================================
    ESTADÍSTICAS
    ========================================
    */

    const todosAtrasados =
      analisis.filter(
        a =>
          a.diasSinSalir >= 7
      );


    const mayorAtraso =
      todosAtrasados
        .slice()
        .sort(
          (a, b) =>
            b.diasSinSalir -
            a.diasSinSalir
        )[0] || null;


    return res.status(200).json({

      ok: true,

      loteria:
        "La Granjita",

      fuente:
        "LotoVen",

      historial:
        historial.length,

      hoy,

      pronosticos,

      pronostico,

      top10,

      atrasados,

      resultadosHoy,

      estadisticas: {

        totalAnimales:
          analisis.length,

        totalHistorial:
          historial.length,

        totalAtrasados:
          todosAtrasados.length,

        mayorAtraso:
          mayorAtraso
            ? mayorAtraso.animal
            : null,

        diasMayorAtraso:
          mayorAtraso
            ? mayorAtraso.diasSinSalir
            : 0,

        candidatosPronostico:
          analisis.filter(
            a =>
              !a.salioHoy
          ).length,

        pronosticosHoy:
          pronosticos.length,

        pronosticoActual:
          pronosticos
            .map(
              a =>
                a.animal
            )
            .join(
              " • "
            ),

        diasPronostico:
          pronostico
            ? pronostico.diasSinSalir
            : 0

      }

    });

  }

  catch (error) {

    console.error(
      "ERROR ANALIZAR GRANJITA:",
      error
    );

    return res.status(500).json({

      ok: false,

      error:
        error.message ||
        "Error interno de La Granjita"

    });

  }

}
