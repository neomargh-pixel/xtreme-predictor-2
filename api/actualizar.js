import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const respuesta = await fetch(
      "https://www.tuazar.com/loteria/animalitos/resultados/"
    );

    const html = await respuesta.text();

    const $ = cheerio.load(html);

    return res.status(200).json({
      ok: true,
      titulo: $("title").text(),
      caracteres: html.length
    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }
}
