import * as cheerio from "cheerio";
import guardarResultados from "../lib/guardarResultados.js";
import analizarResultados from "../lib/analizarResultados.js";
import supabase from "../lib/supabase.js";

const url = "https://lotoven.com/animalito/guacharoactivo/resultados/";

function normalizar(texto) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default async function handler(req, res) {
  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("No se pudo acceder a LotoVen.");
    }

    const html = await respuesta.text();
    const $ = cheerio.load(html);

    const texto = $("body").text().replace(/\s+/g, " ").trim();

    // LotoVen actualmente muestra:
    // Friday, 07 de August de 2026
    const fechaMatch = texto.match(
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*(\d{1,2})\s+de\s+([A-Za-z]+)\s+de\s+(\d{4})/i
    );

    if (!fechaMatch) {
      throw new Error("No se encontró la fecha de los resultados.");
    }

    const dia = fechaMatch[1].padStart(2, "0");
    const nombreMes = fechaMatch[2].toLowerCase();
    const año = fechaMatch[3];

    const meses = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",

      // Por si LotoVen cambia algún día a español
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12"
    };

    const mes = meses[nombreMes];

    if (!mes) {
      throw new Error(`Mes no reconocido: ${nombreMes}`);
    }

    const fecha = `${año}-${mes}-${dia}`;

    const resultados = [];

    /*
      Formato actual de LotoVen:

      17 Pavo Guacharo Activo 08:00 AM
      8 Raton Guacharo Activo 09:00 AM
      47 Pavo Real Guacharo Activo 10:00 AM
    */

    const regex =
      /(\d+)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ ]+?)\s+Guacharo Activo\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;

    let m;

    while ((m = regex.exec(texto)) !== null) {
      const numero = parseInt(m[1], 10);

      const animal = normalizar(m[2]);

      const hora = m[3].toUpperCase().trim();

      const partesHora = hora.match(
        /(\d{1,2}):(\d{2})\s*(AM|PM)/
      );

      if (!partesHora) continue;

      let h = parseInt(partesHora[1], 10);
      const minutos = partesHora[2];
      const periodo = partesHora[3];

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
    }

    if (resultados.length === 0) {
      throw new Error(
        "No se encontraron resultados de Guácharo Activo."
      );
    }

    await guardarResultados(resultados);

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*");

    if (error) {
      throw error;
    }

    const analisis = analizarResultados(historial);

    return res.status(200).json({
      ok: true,
      fuente: "LotoVen",
      fecha,
      encontrados: resultados.length,
      historial: historial.length,
      pronostico: analisis[0] || null,
      top10: analisis.slice(0, 10)
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
