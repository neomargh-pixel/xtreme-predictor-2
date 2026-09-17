/*
==================================================
XTREME PREDICTOR 2.0
ANALIZADOR CENTRAL DE LOTERÍAS
==================================================

Este archivo centraliza el análisis de:

- La Granjita
- El Guacharito Millonario
- Selva Plus
- Ruleta Activa
- Lotto Activo
- Caballos

Guácharo Activo conserva su /api/analizar independiente.
==================================================
*/

import supabase from "../lib/supabase.js";


/*
==================================================
CONFIGURACIÓN
==================================================
*/

const CONFIG = {

  lagranjita: {
    nombre: "La Granjita",
    tabla: "historial_granjita",
    tipo: "animal"
  },

  guacharitomillonario: {
    nombre: "El Guacharito Millonario",
    tabla: "historial_guacharito",
    tipo: "animal"
  },

  selvaplus: {
    nombre: "Selva Plus",
    tabla: "historial_selvaplus",
    tipo: "animal"
  },

  ruletaactiva: {
    nombre: "Ruleta Activa",
    tabla: "historial_ruleta",
    tipo: "animal"
  },

  lottoactivo: {
    nombre: "Lotto Activo",
    tabla: "historial_lotto",
    tipo: "animal"
  },

  caballos: {
    nombre: "Caballos",
    tabla: "historial_caballos",
    tipo: "caballo"
  }

};


/*
==================================================
ZONA HORARIA VENEZUELA
==================================================
*/

const TIME_ZONE = "America/Caracas";


/*
==================================================
FECHA VENEZUELA
==================================================
*/

function fechaVenezuela(fecha) {

  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);

}


/*
==================================================
NORMALIZAR TEXTO
==================================================
*/

function normalizarTexto(texto) {

  return String(texto || "")
    .trim()
    .toUpperCase();

}


/*
==================================================
NORMALIZAR NÚMERO
==================================================
*/

function normalizarNumero(numero) {

  if (numero === null || numero === undefined || numero === "") {
    return null;
  }

  const n = Number(numero);

  return Number.isFinite(n) ? n : null;

}


/*
==================================================
CARGAR TODO EL HISTORIAL
==================================================
*/

async function cargarHistorial(tabla) {

  const todos = [];

  let desde = 0;

  const bloque = 1000;

  while (true) {

    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .order("fecha", {
        ascending: true
      })
      .range(desde, desde + bloque - 1);

    if (error) {
      throw new Error(
        `Error leyendo ${tabla}: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      break;
    }

    todos.push(...data);

    if (data.length < bloque) {
      break;
    }

    desde += bloque;

  }

  return todos;

}


/*
==================================================
OBTENER CAMPOS DEL REGISTRO
==================================================
*/

function obtenerAnimal(registro, tipo) {

  if (tipo === "caballo") {

    return normalizarTexto(
      registro.caballo ||
      registro.animal ||
      registro.nombre
    );

  }

  return normalizarTexto(
    registro.animal ||
    registro.caballo ||
    registro.nombre
  );

}


function obtenerNumero(registro) {

  return normalizarNumero(
    registro.numero
  );

}


/*
==================================================
OBTENER FECHA DEL REGISTRO
==================================================
*/

function obtenerFecha(registro) {

  return fechaVenezuela(
    registro.fecha
  );

}


/*
==================================================
DIFERENCIA DE DÍAS
==================================================
*/

function diferenciaDias(fechaInicial, fechaFinal) {

  if (!fechaInicial || !fechaFinal) {
    return 0;
  }

  const inicio = new Date(
    `${fechaInicial}T00:00:00-04:00`
  );

  const fin = new Date(
    `${fechaFinal}T00:00:00-04:00`
  );

  const diferencia =
    fin.getTime() - inicio.getTime();

  return Math.max(
    0,
    Math.floor(
      diferencia / 86400000
    )
  );

}


/*
==================================================
FRECUENCIA
==================================================
*/

function contarSalidas(
  registros,
  fechaActual,
  dias
) {

  const limite = new Date(
    `${fechaActual}T00:00:00-04:00`
  );

  limite.setDate(
    limite.getDate() - dias + 1
  );

  const limiteTexto =
    limite.toISOString().slice(0, 10);

  return registros.filter(r => {

    const fecha = obtenerFecha(r);

    return (
      fecha &&
      fecha >= limiteTexto &&
      fecha <= fechaActual
    );

  }).length;

}


/*
==================================================
ÚLTIMA FECHA
==================================================
*/

function obtenerUltimaFecha(registros) {

  if (!registros.length) {
    return null;
  }

  const fechas = registros
    .map(obtenerFecha)
    .filter(Boolean)
    .sort();

  return fechas.length
    ? fechas[fechas.length - 1]
    : null;

}


/*
==================================================
ÍNDICE XTREME
==================================================
*/

function calcularIndice(
  salidas30,
  salidas14,
  salidas7,
  diasSinSalir
) {

  const parte30 =
    Math.min(
      45,
      salidas30 * 3
    );

  const parte14 =
    Math.min(
      25,
      salidas14 * 2
    );

  const parte7 =
    Math.min(
      15,
      salidas7 * 2
    );

  const atraso =
    Math.min(
      15,
      diasSinSalir * 2
    );

  return Math.min(
    100,
    parte30 +
    parte14 +
    parte7 +
    atraso
  );

}


/*
==================================================
TENDENCIA
==================================================
*/

function obtenerTendencia(indice) {

  if (indice >= 90) {
    return "MUY ALTA";
  }

  if (indice >= 75) {
    return "ALTA";
  }

  if (indice >= 55) {
    return "MEDIA";
  }

  if (indice >= 35) {
    return "BAJA";
  }

  return "MUY BAJA";

}


/*
==================================================
CATEGORÍA
==================================================
*/

function obtenerCategoria(
  indice,
  diasSinSalir,
  salidas7
) {

  if (diasSinSalir >= 7) {
    return "ATRASADO";
  }

  if (indice >= 80 || salidas7 >= 2) {
    return "CALIENTE";
  }

  if (indice >= 50) {
    return "MEDIO";
  }

  return "NORMAL";

}


/*
==================================================
ANÁLISIS DE UN ANIMAL / CABALLO
==================================================
*/

function analizarElemento(
  nombre,
  numero,
  registros,
  historial,
  hoy
) {

  const ultimaFecha =
    obtenerUltimaFecha(registros);

  const diasSinSalir =
    ultimaFecha
      ? diferenciaDias(
          ultimaFecha,
          hoy
        )
      : 999;

  const salidas7 =
    contarSalidas(
      registros,
      hoy,
      7
    );

  const salidas14 =
    contarSalidas(
      registros,
      hoy,
      14
    );

  const salidas30 =
    contarSalidas(
      registros,
      hoy,
      30
    );

  const indice =
    analizarIndiceSeguro(
      salidas30,
      salidas14,
      salidas7,
      diasSinSalir
    );

  const resultadosHoy =
    registros.filter(r =>
      obtenerFecha(r) === hoy
    );

  const salioHoy =
    resultadosHoy.length > 0;

  return {

    animal: nombre,

    caballo: nombre,

    numero,

    salidas: registros.length,

    salidas7,

    salidas14,

    salidas30,

    diasSinSalir,

    indice,

    porcentaje: indice,

    tendencia:
      obtenerTendencia(indice),

    categoria:
      obtenerCategoria(
        indice,
        diasSinSalir,
        salidas7
      ),

    salioHoy,

    ultimaFecha,

    historial: registros.length,

    frecuencia: {
      dias7: salidas7,
      dias14: salidas14,
      dias30: salidas30
    }

  };

}


/*
==================================================
SEGURIDAD DEL ÍNDICE
==================================================
*/

function analizarIndiceSeguro(
  salidas30,
  salidas14,
  salidas7,
  diasSinSalir
) {

  return calcularIndice(
    salidas30,
    salidas14,
    salidas7,
    diasSinSalir
  );

}


/*
==================================================
RESULTADOS DE HOY
==================================================
*/

function construirResultadosHoy(
  historial,
  tipo,
  hoy
) {

  return historial
    .filter(r =>
      obtenerFecha(r) === hoy
    )
    .sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    )
    .map(r => {

      const nombre =
        obtenerAnimal(r, tipo);

      return {

        animal: nombre,

        caballo: nombre,

        numero:
          obtenerNumero(r),

        fecha:
          r.fecha,

        hora:
          r.fecha,

        salioHoy: true

      };

    });

}


/*
==================================================
CREAR MAPA DE ELEMENTOS
==================================================
*/

function construirMapa(
  historial,
  tipo
) {

  const mapa = new Map();

  for (const registro of historial) {

    const nombre =
      obtenerAnimal(
        registro,
        tipo
      );

    if (!nombre) {
      continue;
    }

    const numero =
      obtenerNumero(
        registro
      );

    const clave =
      `${nombre}|${numero ?? ""}`;

    if (!mapa.has(clave)) {

      mapa.set(
        clave,
        {
          nombre,
          numero,
          registros: []
        }
      );

    }

    mapa
      .get(clave)
      .registros
      .push(registro);

  }

  return mapa;

}


/*
==================================================
CONSTRUIR ANÁLISIS COMPLETO
==================================================
*/

function construirAnalisis(
  historial,
  config,
  hoy
) {

  const mapa =
    construirMapa(
      historial,
      config.tipo
    );

  const elementos = [];

  for (const item of mapa.values()) {

    const resultado =
      analizarElemento(
        item.nombre,
        item.numero,
        item.registros,
        historial,
        hoy
      );

    elementos.push(
      resultado
    );

  }


  /*
  ----------------------------------------------
  ORDEN GENERAL
  ----------------------------------------------
  */

  elementos.sort(
    (a, b) =>
      b.indice - a.indice
  );


  /*
  ----------------------------------------------
  TOP 10
  ----------------------------------------------
  */

  const top10 =
    elementos
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        posicion: index + 1
      }));


  /*
  ----------------------------------------------
  ATRASADOS
  ----------------------------------------------
  */

  const atrasados =
    elementos
      .filter(
        item =>
          item.diasSinSalir >= 7
      )
      .sort(
        (a, b) =>
          b.diasSinSalir -
          a.diasSinSalir
      )
      .slice(0, 10);


  /*
  ----------------------------------------------
  PRONÓSTICOS
  ----------------------------------------------
  */

  const candidatos =
    elementos
      .filter(
        item =>
          !item.salioHoy
      )
      .sort(
        (a, b) =>
          b.indice -
          a.indice
      );


  const pronosticos =
    candidatos
      .slice(0, 3)
      .map(item => ({
        ...item,
        pronostico: true
      }));


  /*
  ----------------------------------------------
  PRONÓSTICO PRINCIPAL
  ----------------------------------------------
  */

  const pronostico =
    pronosticos.length
      ? pronosticos[0]
      : null;


  /*
  ----------------------------------------------
  RESULTADOS DE HOY
  ----------------------------------------------
  */

  const resultadosHoy =
    construirResultadosHoy(
      historial,
      config.tipo,
      hoy
    );


  /*
  ----------------------------------------------
  ESTADÍSTICAS
  ----------------------------------------------
  */

  const mayorAtraso =
    atrasados.length
      ? atrasados[0]
      : null;


  const estadisticas = {

    totalAnimales:
      elementos.length,

    totalCaballos:
      config.tipo === "caballo"
        ? elementos.length
        : 0,

    totalHistorial:
      historial.length,

    totalAtrasados:
      atrasados.length,

    mayorAtraso:
      mayorAtraso
        ? mayorAtraso.animal
        : null,

    diasMayorAtraso:
      mayorAtraso
        ? mayorAtraso.diasSinSalir
        : 0,

    candidatos:
      candidatos.length,

    pronosticosHoy:
      pronosticos.length,

    pronosticoActual:
      pronostico
        ? pronostico.animal
        : null

  };


  /*
  ----------------------------------------------
  LISTA DE ELEMENTOS
  ----------------------------------------------
  */

  const animales =
    elementos.map(item => ({

      animal:
        item.animal,

      caballo:
        item.caballo,

      numero:
        item.numero

    }));


  return {

    ok: true,

    loteria:
      config.nombre,

    fuente:
      "XTREME",

    hoy,

    historial:
      historial.length,

    totalAnimales:
      elementos.length,

    animales,

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
HANDLER PRINCIPAL
==================================================
*/

export default async function handler(
  req,
  res
) {

  try {

    const loteria =
      normalizarTexto(
        req.query?.loteria
      ).toLowerCase();


    /*
    ----------------------------------------------
    VALIDAR LOTERÍA
    ----------------------------------------------
    */

    const config =
      CONFIG[loteria];


    if (!config) {

      return res
        .status(400)
        .json({

          ok: false,

          error:
            "Lotería no válida.",

          loteriasDisponibles:
            Object.keys(CONFIG)

        });

    }


    /*
    ----------------------------------------------
    CARGAR HISTORIAL
    ----------------------------------------------
    */

    const historial =
      await cargarHistorial(
        config.tabla
      );


    /*
    ----------------------------------------------
    FECHA ACTUAL VENEZUELA
    ----------------------------------------------
    */

    const hoy =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: TIME_ZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).format(
        new Date()
      );


    /*
    ----------------------------------------------
    ANALIZAR
    ----------------------------------------------
    */

    const resultado =
      construirAnalisis(
        historial,
        config,
        hoy
      );


    /*
    ----------------------------------------------
    RESPUESTA
    ----------------------------------------------
    */

    return res
      .status(200)
      .json(resultado);


  } catch (error) {

    console.error(
      "ERROR ANALIZAR LOTERIA:",
      error
    );

    return res
      .status(500)
      .json({

        ok: false,

        error:
          error?.message ||
          "Error interno analizando la lotería."

      });

  }

}
