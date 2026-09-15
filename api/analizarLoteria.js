import supabase from "../lib/supabase.js";

const TZ = "America/Caracas";


/*
==================================================
FECHA VENEZUELA
==================================================
*/

function hoyCaracas() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());

}


/*
==================================================
FECHA DEL RESULTADO
==================================================
*/

function fechaResultado(fecha) {

  if (!fecha) return null;

  const texto = String(fecha).trim();

  const match =
    texto.match(/^(\d{4}-\d{2}-\d{2})/);

  if (match) {
    return match[1];
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date(fecha));

}


/*
==================================================
HORA VENEZUELA
==================================================
*/

function horaCaracas(fecha) {

  if (!fecha) return null;

  const texto = String(fecha).trim();

  const match =
    texto.match(
      /(?:T|\s)(\d{1,2}):(\d{2})(?::\d{2})?/
    );

  if (match) {

    let hora = parseInt(match[1], 10);

    const minutos = match[2];

    const periodo =
      hora >= 12
        ? "p. m."
        : "a. m.";

    if (hora === 0) {
      hora = 12;
    }
    else if (hora > 12) {
      hora -= 12;
    }

    return `${String(hora).padStart(2, "0")}:${minutos} ${periodo}`;

  }

  return new Intl.DateTimeFormat(
    "es-VE",
    {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  ).format(new Date(fecha));

}


/*
==================================================
DIFERENCIA DE DÍAS
==================================================
*/

function diferenciaDias(a, b) {

  if (!a || !b) return 999;

  const fechaA =
    new Date(`${a}T12:00:00-04:00`);

  const fechaB =
    new Date(`${b}T12:00:00-04:00`);

  return Math.max(
    0,
    Math.floor(
      (fechaB.getTime() - fechaA.getTime())
      / 86400000
    )
  );

}


/*
==================================================
NORMALIZAR TEXTO
==================================================
*/

function normalizarTexto(valor) {

  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

}


/*
==================================================
HISTORIAL COMPLETO
==================================================
*/

async function obtenerHistorial(tabla) {

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
        .from(tabla)
        .select("*")
        .order(
          "fecha",
          {
            ascending: false
          }
        )
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


/*
==================================================
ANÁLISIS BASE
==================================================
*/

function crearAnalisis(
  historial,
  opciones
) {

  const hoy = hoyCaracas();

  const mapa = new Map();

  historial.forEach(resultado => {

    if (
      !resultado ||
      !resultado.animal ||
      !resultado.fecha
    ) {
      return;
    }

    const animal =
      normalizarTexto(
        resultado.animal
      );

    const fecha =
      fechaResultado(
        resultado.fecha
      );

    if (!fecha) return;

    if (!mapa.has(animal)) {

      mapa.set(
        animal,
        {
          animal,
          numero:
            resultado.numero ?? null,
          salidas: 0,
          fechas: []
        }
      );

    }

    const registro =
      mapa.get(animal);

    registro.salidas++;

    registro.fechas.push(fecha);

  });


  const lista =
    Array.from(
      mapa.values()
    );


  lista.forEach(a => {

    const fechas =
      [
        ...new Set(
          a.fechas
        )
      ]
      .sort();


    a.fechas = fechas;


    a.ultimaFecha =
      fechas.length
        ? fechas[fechas.length - 1]
        : null;


    a.diasSinSalir =
      a.ultimaFecha
        ? diferenciaDias(
            a.ultimaFecha,
            hoy
          )
        : 999;


    a.salidas7 =
      fechas.filter(
        fecha =>
          diferenciaDias(
            fecha,
            hoy
          ) <= 7
      ).length;


    a.salidas14 =
      fechas.filter(
        fecha =>
          diferenciaDias(
            fecha,
            hoy
          ) <= 14
      ).length;


    a.salidas30 =
      fechas.filter(
        fecha =>
          diferenciaDias(
            fecha,
            hoy
          ) <= 30
      ).length;


    /*
    ==============================================
    FÓRMULA
    ==============================================
    */

    if (opciones.tipo === "granjita") {

      a.indice =
        a.salidas7 * 5 +
        a.salidas14 * 3 +
        a.salidas30 * 2 +
        a.diasSinSalir * 2;


      if (a.indice >= 80) {

        a.porcentaje = 95;
        a.tendencia = "MUY ALTA";

      }
      else if (a.indice >= 60) {

        a.porcentaje = 85;
        a.tendencia = "ALTA";

      }
      else if (a.indice >= 40) {

        a.porcentaje = 70;
        a.tendencia = "MEDIA";

      }
      else {

        a.porcentaje = 50;
        a.tendencia = "NORMAL";

      }

    }


    else if (opciones.tipo === "selva") {

      a.indice =
        Math.min(
          100,
          Math.round(
            (a.salidas7 * 8) +
            (a.salidas14 * 3) +
            a.salidas30 +
            Math.min(
              a.diasSinSalir * 2,
              20
            )
          )
        );


      a.porcentaje =
        Math.min(
          95,
          Math.max(
            50,
            a.indice + 15
          )
        );


      if (a.indice >= 80) {
        a.tendencia = "MUY ALTA";
      }
      else if (a.indice >= 60) {
        a.tendencia = "ALTA";
      }
      else if (a.indice >= 40) {
        a.tendencia = "MEDIA";
      }
      else if (a.indice >= 20) {
        a.tendencia = "NORMAL";
      }
      else {
        a.tendencia = "BAJA";
      }

    }


    else if (opciones.tipo === "lotto") {

      const frecuencia =
        Math.min(
          100,
          a.salidas * 3
        );

      const atraso =
        Math.min(
          40,
          a.diasSinSalir * 4
        );

      a.indice =
        Math.min(
          100,
          Math.round(
            frecuencia + atraso
          )
        );


      if (a.indice >= 90) {
        a.tendencia = "MUY ALTA";
      }
      else if (a.indice >= 75) {
        a.tendencia = "ALTA";
      }
      else if (a.indice >= 50) {
        a.tendencia = "MEDIA";
      }
      else if (a.indice >= 25) {
        a.tendencia = "BAJA";
      }
      else {
        a.tendencia = "MUY BAJA";
      }


      a.porcentaje =
        a.indice;


      if (a.diasSinSalir >= 7) {
        a.categoria = "ATRASADO";
      }
      else if (a.indice >= 80) {
        a.categoria = "CALIENTE";
      }
      else if (a.indice >= 50) {
        a.categoria = "MEDIO";
      }
      else {
        a.categoria = "FRÍO";
      }

    }


    else if (opciones.tipo === "ruleta") {

      const frecuencia =
        Math.min(
          100,
          a.salidas * 3
        );

      const atraso =
        Math.min(
          40,
          a.diasSinSalir * 4
        );

      a.indice =
        Math.min(
          100,
          Math.round(
            frecuencia + atraso
          )
        );


      a.porcentaje =
        a.indice;


      if (a.indice >= 90) {
        a.tendencia = "MUY ALTA";
      }
      else if (a.indice >= 75) {
        a.tendencia = "ALTA";
      }
      else if (a.indice >= 50) {
        a.tendencia = "MEDIA";
      }
      else if (a.indice >= 25) {
        a.tendencia = "BAJA";
      }
      else {
        a.tendencia = "MUY BAJA";
      }


      if (a.diasSinSalir >= 7) {
        a.categoria = "ATRASADO";
      }
      else if (a.indice >= 80) {
        a.categoria = "CALIENTE";
      }
      else if (a.indice >= 50) {
        a.categoria = "MEDIO";
      }
      else {
        a.categoria = "FRÍO";
      }

    }

  });


  return lista;

}


/*
==================================================
RESULTADOS DE HOY
==================================================
*/

function obtenerResultadosHoy(
  historial,
  hoy
) {

  const resultadosHoy = {};


  historial.forEach(resultado => {

    const fecha =
      fechaResultado(
        resultado.fecha
      );

    if (fecha !== hoy) {
      return;
    }

    const animal =
      normalizarTexto(
        resultado.animal
      );


    if (!resultadosHoy[animal]) {
      resultadosHoy[animal] = [];
    }


    resultadosHoy[animal].push({

      numero:
        resultado.numero,

      fecha:
        resultado.fecha,

      hora:
        horaCaracas(
          resultado.fecha
        )

    });

  });


  return resultadosHoy;

}


/*
==================================================
MARCAR HOY
==================================================
*/

function marcarHoy(
  analisis,
  resultadosHoy
) {

  analisis.forEach(a => {

    const resultados =
      resultadosHoy[a.animal] || [];


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

}


/*
==================================================
ORDENAMIENTO
==================================================
*/

function ordenar(
  lista
) {

  return lista
    .slice()
    .sort((a, b) => {

      if (
        Number(b.indice) !==
        Number(a.indice)
      ) {

        return (
          Number(b.indice) -
          Number(a.indice)
        );

      }

      if (
        Number(b.diasSinSalir) !==
        Number(a.diasSinSalir)
      ) {

        return (
          Number(b.diasSinSalir) -
          Number(a.diasSinSalir)
        );

      }

      return (
        Number(b.salidas30) -
        Number(a.salidas30)
      );

    });

}


/*
==================================================
PROCESAR LOTERÍA
==================================================
*/

async function procesar(
  tabla,
  nombre,
  tipo,
  totalAnimales
) {

  const historial =
    await obtenerHistorial(
      tabla
    );


  const hoy =
    hoyCaracas();


  if (!historial.length) {

    return {

      ok: true,

      loteria: nombre,

      historial: 0,

      hoy,

      pronosticos: [],

      pronostico: null,

      top10: [],

      atrasados: [],

      resultadosHoy: {},

      estadisticas: {

        totalAnimales,

        totalHistorial: 0,

        totalAtrasados: 0,

        mayorAtraso: null,

        diasMayorAtraso: 0,

        candidatosPronostico: 0,

        pronosticosHoy: 0,

        pronosticoActual: null,

        diasPronostico: 0

      }

    };

  }


  const analisis =
    crearAnalisis(
      historial,
      {
        tipo
      }
    );


  const resultadosHoy =
    obtenerResultadosHoy(
      historial,
      hoy
    );


  marcarHoy(
    analisis,
    resultadosHoy
  );


  /*
  ==============================================
  TOP 10
  ==============================================
  */

  const top10 =
    ordenar(
      analisis
    )
    .slice(
      0,
      10
    );


  /*
  ==============================================
  ATRASADOS
  ==============================================
  */

  const todosAtrasados =
    analisis
      .filter(
        a =>
          Number(
            a.diasSinSalir
          ) >= 7
      )
      .sort(
        (a, b) =>
          Number(
            b.diasSinSalir
          ) -
          Number(
            a.diasSinSalir
          )
      );


  const atrasados =
    todosAtrasados
      .slice(
        0,
        10
      );


  /*
  ==============================================
  PRONÓSTICOS
  ==============================================
  */

  let candidatos;


  if (
    tipo === "granjita"
  ) {

    candidatos =
      analisis
        .filter(
          a =>
            !a.salioHoy
        )
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
        );

  }

  else {

    candidatos =
      ordenar(
        analisis
      );

  }


  const pronosticos =
    candidatos
      .slice(
        0,
        3
      );


  /*
  ==============================================
  MARCAR PRONÓSTICOS
  ==============================================
  */

  analisis.forEach(
    a => {

      a.pronostico =
        false;

      if (
        tipo !== "lotto" &&
        tipo !== "ruleta"
      ) {

        a.categoria =
          a.categoria ||
          "OBSERVACION";

      }

    }
  );


  pronosticos.forEach(
    a => {

      a.pronostico =
        true;

      a.categoria =
        "PRONÓSTICO";

    }
  );


  const pronostico =
    pronosticos[0] ||
    null;


  const mayorAtraso =
    todosAtrasados[0] ||
    null;


  /*
  ==============================================
  ESTADÍSTICAS
  ==============================================
  */

  const estadisticas = {

    totalAnimales,

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
      candidatos.length,

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

  };


  return {

    ok: true,

    loteria: nombre,

    fuente: "XTREME",

    historial:
      historial.length,

    hoy,

    pronosticos,

    pronostico,

    top10,

    atrasados,

    resultadosHoy,

    estadisticas

  };

}


/*
==================================================
HANDLER CENTRAL
==================================================
*/

export default async function handler(
  req,
  res
) {

  try {

    const loteria =
      String(
        req.query?.loteria ||
        ""
      )
      .toLowerCase()
      .trim();


    /*
    ============================================
    LA GRANJITA
    ============================================
    */

    if (
      loteria === "lagranjita"
    ) {

      return res.status(200).json(
        await procesar(
          "historial_granjita",
          "La Granjita",
          "granjita",
          38
        )
      );

    }


    /*
    ============================================
    GUACHARITO
    ============================================
    */

    if (
      loteria ===
      "guacharitomillonario"
    ) {

      return res.status(200).json(
        await procesar(
          "historial_guacharito",
          "El Guacharito Millonario",
          "granjita",
          38
        )
      );

    }


    /*
    ============================================
    SELVA PLUS
    ============================================
    */

    if (
      loteria === "selvaplus"
    ) {

      return res.status(200).json(
        await procesar(
          "historial_selvaplus",
          "Selva Plus",
          "selva",
          38
        )
      );

    }


    /*
    ============================================
    LOTTO ACTIVO
    ============================================
    */

    if (
      loteria === "lottoactivo"
    ) {

      return res.status(200).json(
        await procesar(
          "historial_lotto",
          "Lotto Activo",
          "lotto",
          38
        )
      );

    }


    /*
    ============================================
    RULETA ACTIVA
    ============================================
    */

    if (
      loteria === "ruletaactiva"
    ) {

      return res.status(200).json(
        await procesar(
          "historial_ruleta",
          "Ruleta Activa",
          "ruleta",
          40
        )
      );

    }


    /*
    ============================================
    ERROR
    ============================================
    */

    return res.status(400).json({

      ok: false,

      error:
        "Lotería no especificada o no soportada."

    });

  }

  catch (error) {

    console.error(
      "ERROR ANALIZADOR CENTRAL:",
      error
    );


    return res.status(500).json({

      ok: false,

      error:
        error.message ||
        "Error analizando la lotería."

    });

  }

}
