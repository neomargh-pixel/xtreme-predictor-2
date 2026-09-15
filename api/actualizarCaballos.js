/*
==================================================
XTREME PREDICTOR 2.0
ACTUALIZADOR DE CABALLOS
LA RINCONADA + VALENCIA
==================================================
*/

import * as cheerio from "cheerio";
import supabase from "../lib/supabase.js";

const FUENTES = [
  "https://hipicasenvivo.com/la-rinconda-hinava/"
];

function normalizarTexto(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
}

function numeroCaballo(texto) {
  const match = String(texto || "").match(/\((\d+)\)/);
  return match ? Number(match[1]) : null;
}

function obtenerFechaVenezuela() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function obtenerPagina(url) {
  const respuesta = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-VE,es;q=0.9,en;q=0.8"
    }
  });

  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }

  return await respuesta.text();
}

function extraerResultados(html) {

  const $ = cheerio.load(html);

  const resultados = [];

  let carreraActual = null;
  let hipodromoActual = "La Rinconada";

  $("body")
    .find("*")
    .each((_, elemento) => {

      const texto = normalizarTexto($(elemento).text());

      if (!texto) return;

      /*
      ------------------------------------------
      DETECTAR CARRERA
      ------------------------------------------
      */

      const carrera =
        texto.match(/Carrera\s+(\d+)/i) ||
        texto.match(/(\d+)a\.\s*Carrera/i);

      if (carrera) {
        carreraActual = Number(carrera[1]);
      }

      /*
      ------------------------------------------
      BUSCAR EJEMPLARES
      ------------------------------------------
      */

      const numero = numeroCaballo(texto);

      if (
        numero !== null &&
        carreraActual !== null &&
        texto.length < 180
      ) {

        const limpio = texto
          .replace(/🥇|🥈|🥉/g, "")
          .replace(/1º|2º|3º|4º|5º|6º|7º|8º|9º|10º|11º|12º|13º|14º|15º/g, "")
          .trim();

        /*
        Evitamos guardar textos que claramente
        no corresponden a nombres de caballos.
        */

        if (
          limpio.length >= 3 &&
          !/resultado|dividendo|carrera|tiempo|llegada|jinete|caballos|seleccione/i.test(limpio)
        ) {

          resultados.push({
            hipodromo: hipodromoActual,
            carrera: carreraActual,
            numero,
            nombre: limpio
          });

        }
      }
    });

  return resultados;
}

function eliminarDuplicados(resultados) {

  const mapa = new Map();

  for (const resultado of resultados) {

    const clave =
      `${resultado.hipodromo}|` +
      `${resultado.carrera}|` +
      `${resultado.numero}|` +
      `${resultado.nombre}`;

    if (!mapa.has(clave)) {
      mapa.set(clave, resultado);
    }
  }

  return Array.from(mapa.values());
}

export default async function handler(req, res) {

  try {

    const fecha = obtenerFechaVenezuela();

    let resultados = [];

    let fuenteUtilizada = null;

    for (const fuente of FUENTES) {

      try {

        console.log(`Consultando fuente: ${fuente}`);

        const html = await obtenerPagina(fuente);

        const encontrados = extraerResultados(html);

        if (encontrados.length > 0) {

          resultados = encontrados;
          fuenteUtilizada = fuente;

          break;
        }

      } catch (error) {

        console.error(
          `Error consultando ${fuente}:`,
          error.message
        );

      }
    }

    resultados = eliminarDuplicados(resultados);

    if (resultados.length === 0) {

      return res.status(200).json({
        ok: false,
        loteria: "Caballos",
        fecha,
        encontrados: 0,
        mensaje:
          "No se encontraron resultados de caballos en la fuente."
      });

    }

    /*
    ==============================================
    PREPARAR DATOS PARA SUPABASE
    ==============================================
    */

    const registros = resultados.map(resultado => ({
      hipodromo: resultado.hipodromo,
      carrera: resultado.carrera,
      numero: resultado.numero,
      caballo: resultado.nombre,
      fecha
    }));

    /*
    ==============================================
    GUARDAR
    ==============================================
    */

    const { error } = await supabase
      .from("historial_caballos")
      .upsert(
        registros,
        {
          onConflict:
            "hipodromo,carrera,numero,fecha",
          ignoreDuplicates: true
        }
      );

    if (error) {
      throw error;
    }

    /*
    ==============================================
    RESPUESTA
    ==============================================
    */

    return res.status(200).json({

      ok: true,

      loteria: "Caballos",

      fuente: fuenteUtilizada,

      fecha,

      encontrados: registros.length,

      hipodromos: [
        ...new Set(
          registros.map(r => r.hipodromo)
        )
      ],

      carreras: [
        ...new Set(
          registros.map(r => r.carrera)
        )
      ].sort((a, b) => a - b),

      muestra: registros.slice(0, 10)

    });

  } catch (error) {

    console.error(
      "ERROR actualizarCaballos:",
      error
    );

    return res.status(500).json({

      ok: false,

      loteria: "Caballos",

      error: error.message

    });

  }

}
