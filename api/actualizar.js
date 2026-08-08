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
    const html = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error("No se pudo acceder a LotoVen.");
    }

    const $ = cheerio.load(html);
    const texto = $("body").text();

    const fechaMatch = texto.match(
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}\s+of\s+\w+\s+of\s+\d{4}/i
    );

    if (!fechaMatch) {
      throw new Error("No se encontró la fecha de los resultados.");
    }

    const fechaTexto = fechaMatch[0];

    const meses = {
      january:"01", february:"02", march:"03",
      april:"04", may:"05", june:"06",
      july:"07", august:"08", september:"09",
      october:"10", november:"11", december:"12"
    };

    const fechaPartes = fechaTexto.match(
      /\d{1,2}\s+of\s+(\w+)\s+of\s+(\d{4})/i
    );

    const dia = fechaTexto.match(/\d{1,2}/)[0].padStart(2,"0");
    const mes = meses[fechaPartes[1].toLowerCase()];
    const año = fechaPartes[2];

    const fecha = `${año}-${mes}-${dia}`;

    const resultados = [];

    const regex =
      /(\d+)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ ]+)\s+Guacharo Activo\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;

    let m;

    while ((m = regex.exec(texto)) !== null) {

      const numero = parseInt(m[1]);

      const animal = normalizar(m[2]);

      const hora = m[3].toUpperCase();

      const partesHora = hora.match(
        /(\d{1,2}):(\d{2})\s*(AM|PM)/
      );

      let h = parseInt(partesHora[1]);
      const minutos = partesHora[2];
      const periodo = partesHora[3];

      if (periodo === "PM" && h !== 12) h += 12;
      if (periodo === "AM" && h === 12) h = 0;

      const fechaCompleta =
        `${fecha}T${String(h).padStart(2,"0")}:${minutos}:00-04:00`;

      resultados.push({
        animal,
        numero,
        fecha: fechaCompleta
      });

    }

    if (resultados.length === 0) {
      throw new Error("No se encontraron resultados de Guácharo Activo.");
    }

    await guardarResultados(resultados);

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*");

    if (error) throw error;

    const analisis = analizarResultados(historial);

    return res.status(200).json({
      ok: true,
      fuente: "LotoVen",
      encontrados: resultados.length,
      historial: historial.length,
      pronostico: analisis[0] || null,
      top10: analisis.slice(0,10)
    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}
