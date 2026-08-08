import * as cheerio from "cheerio";
import guardarResultados from "../lib/guardarResultados.js";
import supabase from "../lib/supabase.js";

const BASE =
  "https://lotoven.com/animalito/guacharoactivo";

function normalizar(texto) {
  return String(texto || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fechaISO(fecha) {
  const d = new Date(fecha);

  const año = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function lunesDeSemana(fecha) {
  const d = new Date(fecha);
  d.setUTCHours(0, 0, 0, 0);

  const dia = d.getUTCDay();

  const diferencia = dia === 0 ? -6 : 1 - dia;

  d.setUTCDate(d.getUTCDate() + diferencia);

  return d;
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

function obtenerNumeroAnimal(nombre, mapa) {
  return mapa[normalizar(nombre)];
}

async function obtenerMapaNumeros() {

  const respuesta = await fetch(`${BASE}/estadisticas/`);

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la tabla de animales de LotoVen.");
  }

  const html = await respuesta.text();
  const $ = cheerio.load(html);

  const mapa = {};

  $("tr").each((_, fila) => {

    const celdas = $(fila)
      .find("th, td")
      .map((_, celda) => $(celda).text().replace(/\s+/g, " ").trim())
      .get();

    const texto = celdas.join(" ");

    const match = texto.match(
      /(?:Image)?\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúÑñüÜ ]+?)\s+(?:\d{4}-\d{2}-\d{2}|\d+\s*$)/i
    );

    if (match) {
      const numero = parseInt(match[1], 10);
      const animal = normalizar(match[2]);

      if (animal) {
        mapa[animal] = numero;
      }
    }

  });

  /*
    Segundo método de respaldo.
    Busca directamente patrones del tipo:
    36 Culebra
    15 Zorro
    etc.
  */

  const textoCompleto = $("body")
    .text()
    .replace(/\s+/g, " ");

  const regex = /(?:^|\s)(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúÑñüÜ ]+?)(?=\s+\d{4}-\d{2}-\d{2}|\s+\d+\s|$)/gi;

  let m;

  while ((m = regex.exec(textoCompleto)) !== null) {

    const numero = parseInt(m[1], 10);
    const animal = normalizar(m[2]);

    if (
      animal &&
      animal.length < 30 &&
      !animal.includes("ULTIMA") &&
      !animal.includes("DIAS") &&
      !animal.includes("ANIMALITO") &&
      !animal.includes("NUMERO")
    ) {
      mapa[animal] = numero;
    }

  }

  return mapa;
}

async function obtenerSemana(fechaInicio, mapaNumeros) {

  const inicio = fechaISO(fechaInicio);
  const fin = fechaISO(sumarDias(fechaInicio, 6));

  const url =
    `${BASE}/historial/${inicio}/${fin}/`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`No se pudo obtener el historial ${inicio} al ${fin}.`);
  }

  const html = await respuesta.text();
  const $ = cheerio.load(html);

  const resultados = [];

  /*
    El historial de LotoVen aparece en una tabla:

    Horario | 2026-08-03 | 2026-08-04 | ...
    08:00 AM | Animal | Animal | ...

    Los nombres de los animales vienen en las imágenes.
  */

  $("table").each((_, tabla) => {

    const filas = $(tabla).find("tr");

    if (filas.length < 2) return;

    const encabezados = [];

    $(filas[0])
      .find("th, td")
      .each((i, celda) => {

        const texto = $(celda)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        const match = texto.match(
          /^(\d{4}-\d{2}-\d{2})$/
        );

        if (match) {
          encabezados[i] = match[1];
        }

      });

    if (encabezados.filter(Boolean).length === 0) return;

    filas.slice(1).each((_, fila) => {

      const celdas = $(fila).find("th, td");

      let hora = null;

      celdas.each((i, celda) => {

        const texto = $(celda)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        if (
          i === 0 &&
          /\d{1,2}:\d{2}\s*(AM|PM)/i.test(texto)
        ) {
          hora = texto.toUpperCase();
        }

      });

      if (!hora) return;

      celdas.each((i, celda) => {

        const fecha = encabezados[i];

        if (!fecha) return;

        const imagen = $(celda).find("img").first();

        let animal = "";

        if (imagen.length) {
          animal =
            imagen.attr("alt") ||
            imagen.attr("title") ||
            "";
        }

        if (!animal) {
          animal = $(celda)
            .text()
            .replace(/\s+/g, " ")
            .trim();
        }

        animal = animal
          .replace(/^Image/i, "")
          .trim();

        if (!animal) return;

        animal = normalizar(animal);

        const numero = obtenerNumeroAnimal(
          animal,
          mapaNumeros
        );

        if (numero === undefined) {
          console.log(
            `Animal sin número encontrado: ${animal}`
          );
          return;
        }

        const partesHora = hora.match(
          /(\d{1,2}):(\d{2})\s*(AM|PM)/i
        );

        if (!partesHora) return;

        let h = parseInt(partesHora[1], 10);
        const minutos = partesHora[2];
        const periodo = partesHora[3].toUpperCase();

        if (periodo === "PM" && h !== 12) {
          h += 12;
        }

        if (periodo === "AM" && h === 12) {
          h = 0;
        }

        const fechaCompleta =
          `${fecha}T${String(h).padStart(2, "0")}:${minutos}:00-04:00`;

        resultados.push({
          animal,
          numero,
          fecha: fechaCompleta
        });

      });

    });

  });

  return resultados;
}

export default async function handler(req, res) {

  try {

    const mapaNumeros =
      await obtenerMapaNumeros();

    const hoy = new Date();

    const lunesActual =
      lunesDeSemana(hoy);

    const resultadosTotales = [];

    /*
      Cargamos 5 semanas.
      Eso nos da aproximadamente 35 días
      de historial.
    */

    for (let semana = 0; semana < 5; semana++) {

      const inicio = sumarDias(
        lunesActual,
        -(semana * 7)
      );

      const resultados =
        await obtenerSemana(
          inicio,
          mapaNumeros
        );

      resultadosTotales.push(
        ...resultados
      );

    }

    if (resultadosTotales.length === 0) {
      throw new Error(
        "No se encontraron resultados históricos."
      );
    }

    /*
      Elimina duplicados antes de guardar.
    */

    const unicos = new Map();

    resultadosTotales.forEach((r) => {

      const clave =
        `${r.animal}|${r.numero}|${r.fecha}`;

      unicos.set(clave, r);

    });

    const resultados = [
      ...unicos.values()
    ];

    await guardarResultados(resultados);

    const { data: historial, error } =
      await supabase
        .from("historial")
        .select("*")
        .order("fecha", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    /*
      Diagnóstico para comprobar que
      realmente quedaron varias fechas.
    */

    const fechas = [
      ...new Set(
        historial
          .map((r) =>
            r.fecha
              ? String(r.fecha).substring(0, 10)
              : null
          )
          .filter(Boolean)
      )
    ].sort();

    return res.status(200).json({

      ok: true,

      fuente: "LotoVen",

      cargados: resultados.length,

      historialTotal: historial.length,

      fechasDiferentes: fechas.length,

      fechaMasAntigua: fechas[0] || null,

      fechaMasReciente:
        fechas[fechas.length - 1] || null,

      ultimasFechas:
        fechas.slice(-10)

    });

  } catch (error) {

    return res.status(500).json({

      ok: false,

      error: error.message

    });

  }

}
