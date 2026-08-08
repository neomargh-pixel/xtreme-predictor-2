import * as cheerio from "cheerio";
import guardarResultados from "../lib/guardarResultados.js";
import analizarResultados from "../lib/analizarResultados.js";
import supabase from "../lib/supabase.js";

function quitarAcentos(texto) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function fechaHora(fecha, hora) {
  const m = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!m) return `${fecha}T12:00:00-04:00`;

  let h = Number(m[1]);
  const min = m[2];
  const periodo = m[3].toUpperCase();

  if (periodo === "PM" && h !== 12) h += 12;
  if (periodo === "AM" && h === 12) h = 0;

  return `${fecha}T${String(h).padStart(2,"0")}:${min}:00-04:00`;
}

export default async function handler(req, res) {

  try {

    const hoy = new Date();
    const resultados = [];

    for (let i = 0; i < 31; i++) {

      const d = new Date(hoy);
      d.setDate(d.getDate() - i);

      const fecha =
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0");

      const url =
        `https://www.loteriadehoy.com/animalito/guacharoactivo/resultados/${fecha}/`;

      const respuesta = await fetch(url);

      if (!respuesta.ok) continue;

      const html = await respuesta.text();
      const $ = cheerio.load(html);

      $("h4").each((index, elemento) => {

        const texto = $(elemento).text().trim();

        const m = texto.match(/^(\d+)\s+(.+)$/);

        if (!m) return;

        const numero = parseInt(m[1]);
        const animal = quitarAcentos(m[2]);

        let hora = "";

        let siguiente = $(elemento).next();

        for (let x = 0; x < 5 && siguiente.length; x++) {

          const t = siguiente.text().trim();

          if (/\d+:\d+\s*(AM|PM)/i.test(t)) {
            hora = t.match(/\d+:\d+\s*(AM|PM)/i)[0];
            break;
          }

          siguiente = siguiente.next();
        }

        if (!hora) return;

        resultados.push({
          animal,
          numero,
          fecha: fechaHora(fecha, hora)
        });

      });

    }

    if (resultados.length === 0) {
      return res.status(500).json({
        ok: false,
        error: "No se encontraron resultados de Guácharo Activo."
      });
    }

    const unicos = Array.from(
      new Map(
        resultados.map(r => [
          `${r.numero}-${r.fecha}`,
          r
        ])
      ).values()
    );

    await guardarResultados(unicos);

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*");

    if (error) throw error;

    const analisis = analizarResultados(historial);

    return res.status(200).json({
      ok: true,
      fuente: "LoteriaDeHoy",
      encontrados: unicos.length,
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
