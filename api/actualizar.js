import * as cheerio from "cheerio";
import guardarResultados from "../lib/guardarResultados.js";
import analizarResultados from "../lib/analizarResultados.js";
import supabase from "../lib/supabase.js";

function normalizar(texto) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function fechaLocalVenezuela(fecha, hora) {
  const partes = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!partes) return `${fecha}T12:00:00-04:00`;

  let h = parseInt(partes[1]);
  const minutos = parseInt(partes[2]);
  const ampm = partes[3].toUpperCase();

  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  return `${fecha}T${String(h).padStart(2,"0")}:${String(minutos).padStart(2,"0")}:00-04:00`;
}

export default async function handler(req, res) {

  try {

    const hoy = new Date();

    const fechas = [];

    for (let i = 0; i <= 30; i++) {

      const d = new Date(hoy);
      d.setDate(d.getDate() - i);

      const fecha =
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0");

      fechas.push(fecha);
    }

    const respuestas = await Promise.all(
      fechas.map(async fecha => {

        const url =
          `https://www.loteriadehoy.com/animalito/guacharoactivo/resultados/${fecha}/`;

        try {

          const respuesta = await fetch(url);

          if (!respuesta.ok) return [];

          const html = await respuesta.text();

          const $ = cheerio.load(html);

          const resultados = [];

          $("h4").each((i, elemento) => {

            const texto = $(elemento).text().trim();

            const m = texto.match(/^(\d+)\s+(.+)$/);

            if (!m) return;

            const numero = parseInt(m[1]);
            const animalOriginal = m[2].trim();

            const siguiente = $(elemento).nextAll("h5").first().text().trim();

            if (!siguiente.includes("Guacharo Activo")) return;

            const horaMatch =
              siguiente.match(/(\d+:\d+\s*(?:AM|PM))/i);

            if (!horaMatch) return;

            const animal = normalizar(animalOriginal);

            resultados.push({
              animal,
              numero,
              fecha: fechaLocalVenezuela(
                fecha,
                horaMatch[1]
              )
            });

          });

          return resultados;

        } catch (e) {

          return [];

        }

      })
    );

    const resultados = respuestas.flat();

    if (resultados.length < 100) {

      return res.status(500).json({
        ok: false,
        error: "No se pudieron recuperar suficientes resultados."
      });

    }

    /*
      BORRAMOS EL HISTORIAL ANTIGUO.
      Es necesario porque las 514 filas anteriores
      tienen fechas falsas.
    */

    const { error: borrarError } = await supabase
      .from("historial")
      .delete()
      .gte("id", 0);

    if (borrarError) {
      throw borrarError;
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
      fuente: "LoteriaDeHoy",
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
