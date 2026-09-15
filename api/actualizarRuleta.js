import * as cheerio from "cheerio";
import guardarResultadosRuleta from "../lib/guardarResultadosRuleta.js";

const BASE =
  "https://lotoven.com/animalito/ruletaactiva";

const TZ = "-04:00";

const animalesRuleta = {
  "00": "BALLENA",
  "0": "DELFIN",
  "1": "CARNERO",
  "2": "TORO",
  "3": "CIEMPIES",
  "4": "ALACRAN",
  "5": "LEON",
  "6": "RANA",
  "7": "PERICO",
  "8": "RATON",
  "9": "AGUILA",
  "10": "TIGRE",
  "11": "GATO",
  "12": "CABALLO",
  "13": "MONO",
  "14": "PALOMA",
  "15": "ZORRO",
  "16": "OSO",
  "17": "PAVO",
  "18": "BURRO",
  "19": "CHIVO",
  "20": "COCHINO",
  "21": "GALLO",
  "22": "CAMELLO",
  "23": "CEBRA",
  "24": "IGUANA",
  "25": "GALLINA",
  "26": "VACA",
  "27": "PERRO",
  "28": "ZAMURO",
  "29": "ELEFANTE",
  "30": "CAIMAN",
  "31": "LAPA",
  "32": "ARDILLA",
  "33": "PESCADO",
  "34": "VENADO",
  "35": "JIRAFA",
  "36": "CULEBRA",
  "37": "TORTUGA",
  "38": "BUFALO"
};

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerNumeroPorAnimal(animal) {

  const buscado =
    normalizarTexto(animal);

  for (const [numero, nombre] of Object.entries(
    animalesRuleta
  )) {

    if (
      normalizarTexto(nombre) ===
      buscado
    ) {
      return numero;
    }
  }

  return null;
}

function convertirFechaVenezuela(fecha, hora) {

  const fechaLimpia =
    String(fecha || "").trim();

  const horaLimpia =
    String(hora || "").trim();

  if (!fechaLimpia || !horaLimpia) {
    return null;
  }

  let hora24 = horaLimpia;

  const match =
    horaLimpia.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

  if (match) {

    let h =
      Number(match[1]);

    const minutos =
      match[2];

    const periodo =
      match[3]
        ? match[3].toUpperCase()
        : null;

    if (periodo === "PM" && h !== 12) {
      h += 12;
    }

    if (periodo === "AM" && h === 12) {
      h = 0;
    }

    hora24 =
      `${String(h).padStart(2, "0")}:${minutos}`;
  }

  return `${fechaLimpia}T${hora24}:00${TZ}`;
}

function extraerNumero(texto) {

  const limpio =
    normalizarTexto(texto);

  const match =
    limpio.match(/\b(00|0|[1-9]|[1-2][0-9]|3[0-8])\b/);

  return match
    ? match[1]
    : null;
}

function extraerAnimalDesdeCelda(celda) {

  const imagen =
    celda.find("img").first();

  const alt =
    imagen.attr("alt") ||
    "";

  let animal =
    alt
      .replace(/^Image/i, "")
      .trim();

  if (!animal) {

    animal =
      celda.text()
        .trim();
  }

  animal =
    animal
      .replace(/\s+/g, " ")
      .trim();

  return animal;
}

async function descargar(url) {

  const respuesta =
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml"
      },
      cache: "no-store"
    });

  if (!respuesta.ok) {
    throw new Error(
      `LotoVen respondió ${respuesta.status}`
    );
  }

  return await respuesta.text();
}

function obtenerFechaISO(fecha) {

  const texto =
    String(fecha || "").trim();

  const match =
    texto.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return null;
  }

  return texto;
}

function extraerResultados(html) {

  const $ =
    cheerio.load(html);

  const resultados = [];

  $("table").each(
    (_, tabla) => {

      const filas =
        $(tabla).find("tr");

      if (filas.length < 2) {
        return;
      }

      const encabezados = [];

      $(filas[0])
        .find("th,td")
        .each((_, celda) => {

          encabezados.push(
            $(celda)
              .text()
              .trim()
          );
        });

      const fechas =
        encabezados
          .map(
            obtenerFechaISO
          )
          .filter(Boolean);

      if (fechas.length === 0) {
        return;
      }

      filas.slice(1).each(
        (_, fila) => {

          const celdas =
            $(fila)
              .find("td");

          if (celdas.length < 2) {
            return;
          }

          const hora =
            $(celdas[0])
              .text()
              .trim();

          if (!hora) {
            return;
          }

          for (
            let i = 0;
            i < fechas.length;
            i++
          ) {

            const celda =
              celdas[i + 1];

            if (!celda) {
              continue;
            }

            const animal =
              extraerAnimalDesdeCelda(
                $(celda)
              );

            if (!animal) {
              continue;
            }

            const numero =
              extraerNumero(
                $(celda).text()
              ) ||
              obtenerNumeroPorAnimal(
                animal
              );

            if (!numero) {
              continue;
            }

            const fecha =
              convertirFechaVenezuela(
                fechas[i],
                hora
              );

            if (!fecha) {
              continue;
            }

            resultados.push({
              animal:
                normalizarTexto(animal),
              numero:
                Number(numero),
              fecha
            });
          }
        }
      );
    }
  );

  return resultados;
}

function fechaHaceDias(
  fecha,
  dias
) {

  const copia =
    new Date(fecha);

  copia.setUTCDate(
    copia.getUTCDate() - dias
  );

  return copia
    .toISOString()
    .slice(0, 10);
}

export default async function handler(
  req,
  res
) {

  try {

    const hoy =
      new Date();

    const fin =
      hoy
        .toISOString()
        .slice(0, 10);

    const inicio =
      fechaHaceDias(
        hoy,
        35
      );

    const url =
      `${BASE}/historial/${inicio}/${fin}/`;

    console.log(
      "Consultando Ruleta Activa:",
      url
    );

    const html =
      await descargar(url);

    const resultados =
      extraerResultados(html);

    if (
      resultados.length === 0
    ) {
      throw new Error(
        "No se encontraron resultados de Ruleta Activa."
      );
    }

    await guardarResultadosRuleta(
      resultados
    );

    const fechas =
      resultados
        .map(x => x.fecha)
        .sort();

    res.status(200).json({
      ok: true,
      loteria:
        "Ruleta Activa",
      fuente:
        "LotoVen",
      encontrados:
        resultados.length,
      fechaMasAntigua:
        fechas[0] || null,
      fechaMasReciente:
        fechas[fechas.length - 1] || null
    });

  } catch (error) {

    console.error(
      "ERROR ACTUALIZANDO RULETA:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error.message ||
        "Error actualizando Ruleta Activa."
    });
  }
}
