/*
==================================================
XTREME PREDICTOR 2.0
ACTUALIZADOR DE CABALLOS
LA RINCONADA + VALENCIA
VERSIÓN ESTRUCTURADA
==================================================
*/

import * as cheerio from "cheerio";
import supabase from "../lib/supabase.js";

const FUENTES = [
  "https://hipicasenvivo.com/la-rinconda-hinava/"
];


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


function limpiarNombreCaballo(nombre) {

  return normalizarTexto(nombre)
    .replace(/🥇|🥈|🥉/g, "")
    .replace(/^\d+\s*º\s*/i, "")
    .trim();

}


function numeroCaballo(texto) {

  const match = String(texto || "")
    .match(/\((\d+)\)/);

  return match
    ? Number(match[1])
    : null;

}


function obtenerFechaVenezuela() {

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

}


/*
==================================================
FECHAS
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
  diciembre: 12
};


function convertirFecha(texto) {

  const limpio = normalizarTexto(texto)
    .toLowerCase();

  const match = limpio.match(
    /(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo),?\s+(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i
  );

  if (!match) {
    return null;
  }

  const dia = Number(match[1]);

  const mesNombre = match[2]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const mes = MESES[mesNombre];

  const año = Number(match[3]);

  if (!mes || !dia || !año) {
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
PÁGINA
==================================================
*/

async function obtenerPagina(url) {

  const respuesta = await fetch(url, {

    headers: {

      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",

      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

      "Accept-Language":
        "es-VE,es;q=0.9,en;q=0.8"

    }

  });

  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }

  return await respuesta.text();

}


/*
==================================================
EXTRAER TEXTO CON SALTOS
==================================================
*/

function obtenerLineas(html) {

  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  let contenido = $("body").html() || "";

  contenido = contenido
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const texto = cheerio
    .load(`<div>${contenido}</div>`)
    .text();

  return texto
    .split(/\r?\n/)
    .map(normalizarTexto)
    .filter(Boolean);

}


/*
==================================================
HIPÓDROMO
==================================================
*/

function detectarHipodromo(texto) {

  const limpio = normalizarTexto(texto)
    .toUpperCase();

  if (
    limpio.includes("NACIONAL DE VALENCIA") ||
    limpio.includes("VALENCIA")
  ) {
    return "Valencia";
  }

  if (
    limpio.includes("RESULTADOS LA RINCONADA") ||
    limpio.includes("LA RINCONADA")
  ) {
    return "La Rinconada";
  }

  return null;

}


/*
==================================================
CARRERA
==================================================
*/

function detectarCarrera(texto) {

  const limpio = normalizarTexto(texto);

  const match =
    limpio.match(/^Carrera\s+(\d+)\s+(\d+)\s*m/i) ||
    limpio.match(/^Carrera\s+(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    carrera: Number(match[1]),
    distancia: match[2]
      ? Number(match[2])
      : null
  };

}


/*
==================================================
LLEGADA
==================================================
*/

function extraerLlegada(texto) {

  const limpio = normalizarTexto(texto);

  /*
  Ejemplos:

  1º TINTA FINA (6) · VELIZ R WINDER J

  2º BULMA (4) · GONZALEZ YAMPER · 3 1/2

  🥇 1º TINTA FINA (6) · VELIZ R WINDER J
  */

  const match = limpio.match(
    /^(?:🥇|🥈|🥉)?\s*(\d+)\s*º\s+(.+?)\s*\((\d+)\)(?:\s*·\s*(.*))?$/i
  );

  if (!match) {
    return null;
  }

  const posicion = Number(match[1]);

  const nombre = limpiarNombreCaballo(match[2]);

  const resto = normalizarTexto(match[4] || "");

  if (!nombre || !posicion) {
    return null;
  }

  let partes = resto
    .split("·")
    .map(normalizarTexto)
    .filter(Boolean);

  let jinete = null;
  let margen = null;

  if (partes.length > 0) {

    jinete = partes[0] || null;

  }

  if (partes.length > 1) {

    margen = partes
      .slice(1)
      .join(" · ") || null;

  }

  /*
  Si por alguna razón el margen quedó pegado
  al jinete, intentamos reconocer los formatos
  habituales de distancia.
  */

  if (
    jinete &&
    !margen
  ) {

    const margenMatch = jinete.match(
      /\s+(CABEZA|CUELLO|NARIZ|PESCUEZO|\d+(?:\s+\d+\/\d+)?(?:\s*(?:1\/2|1\/4|3\/4))?)$/i
    );

    if (margenMatch) {

      margen = margenMatch[1];

      jinete = jinete
        .replace(margenMatch[0], "")
        .trim();

    }

  }

  return {

    posicion,
    numero: Number(match[3]),
    caballo: nombre,
    jinete,
    margen

  };

}


/*
==================================================
FECHA DE UNA SECCIÓN
==================================================
*/

function detectarFecha(texto) {

  const fecha = convertirFecha(texto);

  return fecha;

}


/*
==================================================
EXTRACCIÓN PRINCIPAL
==================================================
*/

function extraerResultados(html) {

  const lineas = obtenerLineas(html);

  const resultados = [];

  let hipodromoActual = null;

  let carreraActual = null;

  let distanciaActual = null;

  let fechaActual = null;


  for (let i = 0; i < lineas.length; i++) {

    const linea = lineas[i];


    /*
    ----------------------------------------------
    FECHA
    ----------------------------------------------
    */

    const nuevaFecha = detectarFecha(linea);

    if (nuevaFecha) {

      fechaActual = nuevaFecha;

    }


    /*
    ----------------------------------------------
    HIPÓDROMO
    ----------------------------------------------
    */

    const nuevoHipodromo =
      detectarHipodromo(linea);

    if (nuevoHipodromo) {

      hipodromoActual = nuevoHipodromo;

      carreraActual = null;
      distanciaActual = null;

    }


    /*
    ----------------------------------------------
    CARRERA
    ----------------------------------------------
    */

    const nuevaCarrera =
      detectarCarrera(linea);

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
      extraerLlegada(linea);

    if (
      llegada &&
      hipodromoActual &&
      carreraActual
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
          fechaActual ||
          obtenerFechaVenezuela()

      });

    }

  }


  return resultados;

}


/*
==================================================
DUPLICADOS
==================================================
*/

function eliminarDuplicados(resultados) {

  const mapa = new Map();


  for (const resultado of resultados) {

    const clave = [

      resultado.hipodromo,

      resultado.carrera,

      resultado.numero,

      resultado.fecha

    ].join("|");


    /*
    Si existe la misma combinación,
    conservamos la primera.
    */

    if (!mapa.has(clave)) {

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
PREPARAR REGISTROS SUPABASE
==================================================
*/

function prepararRegistros(resultados) {

  return resultados.map(resultado => ({

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

  }));

}


/*
==================================================
HANDLER
==================================================
*/

export default async function handler(req, res) {

  try {

    const fechaActual =
      obtenerFechaVenezuela();


    let resultados = [];

    let fuenteUtilizada = null;


    /*
    ----------------------------------------------
    CONSULTAR FUENTES
    ----------------------------------------------
    */

    for (const fuente of FUENTES) {

      try {

        console.log(
          `Consultando fuente de caballos: ${fuente}`
        );


        const html =
          await obtenerPagina(fuente);


        const encontrados =
          extraerResultados(html);


        console.log(
          `Resultados encontrados: ${encontrados.length}`
        );


        if (encontrados.length > 0) {

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
    ELIMINAR DUPLICADOS
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

      return res.status(200).json({

        ok: false,

        loteria: "Caballos",

        fecha:
          fechaActual,

        encontrados: 0,

        mensaje:
          "No se encontraron resultados estructurados de caballos."

      });

    }


    /*
    ----------------------------------------------
    REGISTROS
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

    const { error } =
      await supabase
        .from("historial_caballos")
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


    const carrerasPorHipodromo = {};


    for (const registro of registros) {

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


    /*
    ----------------------------------------------
    RESPUESTA
    ----------------------------------------------
    */

    return res.status(200).json({

      ok: true,

      loteria:
        "Caballos",

      fuente:
        fuenteUtilizada,

      fechaActual,

      encontrados:
        registros.length,

      hipodromos,

      fechas,

      carrerasPorHipodromo,

      muestra:
        registros.slice(0, 20)

    });


  } catch (error) {

    console.error(
      "ERROR actualizarCaballos:",
      error
    );


    return res.status(500).json({

      ok: false,

      loteria:
        "Caballos",

      error:
        error.message

    });

  }

}
