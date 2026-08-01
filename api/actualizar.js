import * as cheerio from "cheerio";

export default async function handler(req, res) {

  try {

    const respuesta = await fetch("https://www.tuazar.com/loteria/animalitos/resultados/");
    const html = await respuesta.text();

    const $ = cheerio.load(html);

    const texto = $.text();

    const resultados = [];

    const regex = /(\d+)\s*-\s*([A-ZÁÉÍÓÚÑ]+)/g;

    let m;

    while ((m = regex.exec(texto)) !== null) {

      resultados.push({
        numero: parseInt(m[1]),
        animal: m[2]
      });

    }

    res.status(200).json(resultados);

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}
