/*
==================================================
XTREME PREDICTOR 2.0
ACTUALIZADOR DE CABALLOS
LA RINCONADA + VALENCIA
VERSIÓN CORREGIDA
==================================================
*/

import * as cheerio from "cheerio";
import supabase from "../lib/supabase.js";


/*
==================================================
FUENTES
==================================================
*/

const FUENTES = [
  "https://hipicasenvivo.com/la-rinconda-hinava/"
];


const TIME_ZONE = "America/Caracas";


/*
==================================================
MESES
==================================================
*/

const MESES = {

  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,

  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12

};


/*
==================================================
UTILIDADES
==================================================
*/

function normalizarTexto(texto) {

  return String(texto || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}


function obtenerFechaVenezuela() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());

}


/*
==================================================
CONVERTIR FECHA
==================================================
*/

function convertirFecha(texto) {

  const limpio =
    normalizarTexto(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");


  /*
  ----------------------------------------------
  FORMATO:
  domingo, 13 de septiembre de 2026
  ----------------------------------------------
  */

  let match =
    limpio.match(
      /(?:lunes|martes|miercoles|jueves|viernes|sabado|domingo),?\s+(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/i
    );


  if (match) {

    const dia =
      Number(match[1]);

    const mes =
      MESES[match[2]];

    const año =
      Number(match[3]);

    if (
      mes &&
      dia &&
      año
    ) {

      return [
        año,
        String(mes).padStart(2, "0"),
        String(dia).padStart(2, "0")
      ].join("-");

    }

  }


  /*
  ----------------------------------------------
  FORMATO:
  17/09/2026
  ----------------------------------------------
  */

  match =
    limpio.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );


  if (match) {

    return [
      Number(match[3]),
      String(Number(match[2])).padStart(2, "0"),
      String(Number(match[1])).padStart(2, "0")
    ].join("-");

  }


  /*
  ----------------------------------------------
  FORMATO:
  SEP
  13
  2026

  SE PROCESA EN LA FUNCIÓN PRINCIPAL
  ----------------------------------------------
  */

  return null;

}


/*
==================================================
FECHA POR BLOQUE SEP / 13 / 2026
==================================================
*/

function convertirFechaSeparada(
  lineas,
  indice
) {

  if (
    indice + 2 >=
    lineas.length
  ) {

    return null;

  }


  const mesTexto =
    normalizarTexto(
      lineas[indice]
    )
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");


  const diaTexto =
    normalizarTexto(
      lineas[indice + 1]
    );


  const añoTexto =
    normalizarTexto(
      lineas[indice + 2]
    );


  const mes =
    MESES[mesTexto];

  const dia =
    Number(diaTexto);

  const año =
    Number(añoTexto);


  if (
    !mes ||
    !dia ||
    !añoTexto.match(/^\d{4}$/)
  ) {

    return null;

  }


  return [
    año,
    String(mes).padStart(2, "0"),
    String(dia).padStart(2, "0")
  ].join("-");

}


/*
==================================================
OBTENER PÁGINA
==================================================
*/

async function obtenerPagina(url) {

  const respuesta =
    await fetch(
      url,
      {
        headers: {

          "User-Agent":
            "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",

          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

          "Accept-Language":
            "es-VE,es;q=0.9,en;q=0.8"

        }
      }
    );


  if (!respuesta.ok) {

    throw new Error(
      `HTTP ${respuesta.status}`
    );

  }


  return await respuesta.text();

}


/*
==================================================
OBTENER LÍNEAS
==================================================
*/

function obtenerLineas(html) {

  const $ =
    cheerio.load(html);


  $("script, style, noscript")
    .remove();


  let contenido =
    $("body").html() || "";


  contenido =
    contenido
      .replace(
        /<br\s*\/?>/gi,
        "\n"
      )
      .replace(
        /<\/(p|div|section|article|h1|h2|h3|h4|h5|li|tr)>/gi,
        "\n"
      )
      .replace(
        /<[^>]+>/g,
        " "
      );


  const texto =
    cheerio
      .load(
        `<div>${contenido}</div>`
      )
      .text();


  return texto
    .split(/\r?\n/)
    .map(normalizarTexto)
    .filter(Boolean);

}


/*
==================================================
DETECTAR HIPÓDROMO
==================================================
*/

function detectarHipodromo(texto) {

  const limpio =
    normalizarTexto(texto)
      .toUpperCase();


  if (
    limpio.includes(
      "NACIONAL DE VALENCIA"
    ) ||
    limpio.includes(
      "HIPÓDROMO DE VALENCIA"
    ) ||
    limpio.includes(
      "HIPODROMO DE VALENCIA"
    ) ||
    limpio === "VALENCIA"
  ) {

    return "Valencia";

  }


  if (
    limpio.includes(
      "RESULTADOS LA RINCONADA"
    ) ||
    limpio.includes(
      "LA RINCONADA"
    ) ||
    limpio.includes(
      "RINCONADA"
    )
  ) {

    return "La Rinconada";

  }


  return null;

}


/*
==================================================
DETECTAR CARRERA
==================================================
*/

function detectarCarrera(texto) {

  const limpio =
    normalizarTexto(texto);


  let match =
    limpio.match(
      /^Carrera\s+(\d+)\s+(\d+)\s*m/i
    );


  if (!match) {

    match =
      limpio.match(
        /^Carrera\s+(\d+)/i
      );

  }


  if (!match) {

    return null;

  }


  return {

    carrera:
      Number(match[1]),

    distancia:
      match[2]
        ? Number(match[2])
        : null

  };

}


/*
==================================================
LIMPIAR NOMBRE
==================================================
*/

function limpiarNombreCaballo(
  nombre
) {

  return normalizarTexto(nombre)
    .replace(
      /🥇|🥈|🥉/g,
      ""
    )
    .trim();

}


/*
==================================================
EXTRAER LLEGADA
==================================================
*/

function extraerLlegada(texto) {

  const limpio =
    normalizarTexto(texto);


  const match =
    limpio.match(
      /^(?:🥇|🥈|🥉)?\s*(\d+)\s*º\s+(.+?)\s*\((\d+)\)(?:\s*·\s*(.*))?$/i
    );


  if (!match) {

    return null;

  }


  const posicion =
    Number(match[1]);


  const nombre =
    limpiarNombreCaballo(
      match[2]
    );


  const resto =
    normalizarTexto(
      match[4] || ""
    );


  if (
    !nombre ||
    !posicion
  ) {

    return null;

  }


  const partes =
    resto
      .split("·")
      .map(normalizarTexto)
      .filter(Boolean);


  let jinete =
    null;

  let margen =
    null;


  if (
    partes.length > 0
  ) {

    jinete =
      partes[0] || null;

  }


  if (
    partes.length > 1
  ) {

    margen =
      partes
        .slice(1)
        .join(" · ") ||
      null;

  }


  /*
  ----------------------------------------------
  MARGEN PEGADO AL JINETE
  ----------------------------------------------
  */

  if (
    jinete &&
    !margen
  ) {

    const margenMatch =
      jinete.match(
        /\s+(CABEZA|CUELLO|NARIZ|PESCUEZO|\d+(?:\s+\d+\/\d+)?(?:\s*(?:1\/2|1\/4|3\/4))?)$/i
      );


    if (margenMatch) {

      margen =
        margenMatch[1];


      jinete =
        jinete
          .replace(
            margenMatch[0],
            ""
          )
          .trim();

    }

  }


  return {

    posicion,

    numero:
      Number(match[3]),

    caballo:
      nombre,

    jinete,

    margen

  };

}


/*
==================================================
EXTRAER RETIRADO
==================================================
*/

function extraerRetirado(texto) {

  const limpio =
    normalizarTexto(texto);


  const match =
    limpio.match(
      /^#\s*(\d+)\s*[–-]\s*(.+)$/i
    );


  if (!match) {

    return null;

  }


  return {

    numero:
      Number(match[1]),

    caballo:
      limpiarNombreCaballo(
        match[2]
      )

  };

}


/*
==================================================
EXTRACCIÓN PRINCIPAL
==================================================
*/

function extraerResultados(html) {

  const lineas =
    obtenerLineas(html);


  const resultados = [];


  let hipodromoActual =
    null;

  let carreraActual =
    null;

  let distanciaActual =
    null;

  let fechaActual =
    null;


  for (
    let i = 0;
    i < lineas.length;
    i++
  ) {

    const linea =
      lineas[i];


    /*
    ----------------------------------------------
    FECHA COMPLETA EN UNA LÍNEA
    ----------------------------------------------
    */

    const nuevaFecha =
      convertirFecha(
        linea
      );


    if (nuevaFecha) {

      fechaActual =
        nuevaFecha;

      carreraActual =
        null;

      distanciaActual =
        null;

    }


    /*
    ----------------------------------------------
    FECHA SEPARADA:
    SEP
    13
    2026
    ----------------------------------------------
    */

    const fechaSeparada =
      convertirFechaSeparada(
        lineas,
        i
      );


    if (fechaSeparada) {

      fechaActual =
        fechaSeparada;

      carreraActual =
        null;

      distanciaActual =
        null;

    }


    /*
    ----------------------------------------------
    HIPÓDROMO
    ----------------------------------------------
    */

    const nuevoHipodromo =
      detectarHipodromo(
        linea
      );


    if (nuevoHipodromo) {

      hipodromoActual =
        nuevoHipodromo;

      carreraActual =
        null;

      distanciaActual =
        null;

    }


    /*
    ----------------------------------------------
    CARRERA
    ----------------------------------------------
    */

    const nuevaCarrera =
      detectarCarrera(
        linea
      );


    if (nuevaCarrera) {

      carreraActual =
        nuevaCarrera.carrera;

      distanciaActual =
        nuevaCarrera.distancia;

      continue;

    }


    /*
    ----------------------------------------------
    LLEGADA
    ----------------------------------------------
    */

    const llegada =
      extraerLlegada(
        linea
      );


    if (
      llegada &&
      hipodromoActual &&
      carreraActual &&
      fechaActual
    ) {

      resultados.push({

        hipodromo:
          hipodromoActual,

        carrera:
          carreraActual,

        distancia:
          distanciaActual,

        posicion:
          llegada.posicion,

        numero:
          llegada.numero,

        caballo:
          llegada.caballo,

        jinete:
          llegada.jinete,

        entrenador:
          null,

        peso:
          null,

        margen:
          llegada.margen,

        fecha:
          fechaActual

      });

    }

  }


  return resultados;

}


/*
==================================================
ELIMINAR DUPLICADOS
==================================================
*/

function eliminarDuplicados(
  resultados
) {

  const mapa =
    new Map();


  for (
    const resultado of resultados
  ) {

    const clave = [

      resultado.hipodromo,

      resultado.carrera,

      resultado.numero,

      resultado.fecha

    ].join("|");


    if (
      !mapa.has(clave)
    ) {

      mapa.set(
        clave,
        resultado
      );

    }

  }


  return Array.from(
    mapa.values()
  );

}


/*
==================================================
PREPARAR REGISTROS
==================================================
*/

function prepararRegistros(
  resultados
) {

  return resultados.map(
    resultado => ({

      hipodromo:
        resultado.hipodromo,

      carrera:
        resultado.carrera,

      numero:
        resultado.numero,

      caballo:
        resultado.caballo,

      posicion:
        resultado.posicion,

      distancia:
        resultado.distancia,

      jinete:
        resultado.jinete,

      entrenador:
        resultado.entrenador,

      peso:
        resultado.peso,

      margen:
        resultado.margen,

      fecha:
        resultado.fecha,

      fecha_carrera:
        resultado.fecha

    })
  );

}


/*
==================================================
RESUMEN
==================================================
*/

function construirResumen(
  registros
) {

  const hipodromos =
    [
      ...new Set(
        registros.map(
          r => r.hipodromo
        )
      )
    ];


  const fechas =
    [
      ...new Set(
        registros.map(
          r => r.fecha_carrera
        )
      )
    ]
    .sort();


  const carrerasPorHipodromo =
    {};


  for (
    const registro of registros
  ) {

    if (
      !carrerasPorHipodromo[
        registro.hipodromo
      ]
    ) {

      carrerasPorHipodromo[
        registro.hipodromo
      ] = [];

    }


    if (
      !carrerasPorHipodromo[
        registro.hipodromo
      ].includes(
        registro.carrera
      )
    ) {

      carrerasPorHipodromo[
        registro.hipodromo
      ].push(
        registro.carrera
      );

    }

  }


  for (
    const hipodromo of
    Object.keys(
      carrerasPorHipodromo
    )
  ) {

    carrerasPorHipodromo[
      hipodromo
    ].sort(
      (a, b) => a - b
    );

  }


  return {

    hipodromos,

    fechas,

    carrerasPorHipodromo

  };

}


/*
==================================================
HANDLER
==================================================
*/

export default async function handler(
  req,
  res
) {

  try {

    const fechaActual =
      obtenerFechaVenezuela();


    let resultados = [];

    let fuenteUtilizada =
      null;


    /*
    ----------------------------------------------
    CONSULTAR FUENTE
    ----------------------------------------------
    */

    for (
      const fuente of FUENTES
    ) {

      try {

        console.log(
          `Consultando fuente de caballos: ${fuente}`
        );


        const html =
          await obtenerPagina(
            fuente
          );


        const encontrados =
          extraerResultados(
            html
          );


        console.log(
          `Resultados encontrados: ${encontrados.length}`
        );


        if (
          encontrados.length > 0
        ) {

          resultados =
            encontrados;

          fuenteUtilizada =
            fuente;

          break;

        }

      } catch (error) {

        console.error(
          `Error consultando ${fuente}:`,
          error.message
        );

      }

    }


    /*
    ----------------------------------------------
    DUPLICADOS
    ----------------------------------------------
    */

    resultados =
      eliminarDuplicados(
        resultados
      );


    /*
    ----------------------------------------------
    SIN RESULTADOS
    ----------------------------------------------
    */

    if (
      resultados.length === 0
    ) {

      return res
        .status(200)
        .json({

          ok: false,

          loteria:
            "Caballos",

          fecha:
            fechaActual,

          encontrados: 0,

          mensaje:
            "No se encontraron resultados estructurados de caballos."

        });

    }


    /*
    ----------------------------------------------
    PREPARAR
    ----------------------------------------------
    */

    const registros =
      prepararRegistros(
        resultados
      );


    /*
    ----------------------------------------------
    GUARDAR SUPABASE
    ----------------------------------------------
    */

    const {
      error
    } =
      await supabase
        .from(
          "historial_caballos"
        )
        .upsert(
          registros,
          {
            onConflict:
              "hipodromo,carrera,numero,fecha_carrera",

            ignoreDuplicates:
              false

          }
        );


    if (error) {

      throw error;

    }


    /*
    ----------------------------------------------
    RESUMEN
    ----------------------------------------------
    */

    const resumen =
      construirResumen(
        registros
      );


    /*
    ----------------------------------------------
    RESPUESTA
    ----------------------------------------------
    */

    return res
      .status(200)
      .json({

        ok: true,

        loteria:
          "Caballos",

        fuente:
          fuenteUtilizada,

        fechaActual,

        encontrados:
          registros.length,

        hipodromos:
          resumen.hipodromos,

        fechas:
          resumen.fechas,

        carrerasPorHipodromo:
          resumen.carrerasPorHipodromo,

        muestra:
          registros.slice(
            0,
            20
          )

      });


  } catch (error) {

    console.error(
      "ERROR actualizarCaballos:",
      error
    );


    return res
      .status(500)
      .json({

        ok: false,

        loteria:
          "Caballos",

        error:
          error?.message ||
          "Error actualizando caballos."

      });

  }

}
