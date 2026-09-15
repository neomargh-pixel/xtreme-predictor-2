import * as cheerio from "cheerio";
import guardarResultadosLotto from "../lib/guardarResultadosLotto.js";

const BASE =
  "https://lotoven.com/animalito/lottoactivo";

const BASE_RESULTADOS_VENEZUELA =
  "https://resultadosvenezuela.com/lottery/lotto-activo";

const TZ = "-04:00";

const animalesLotto = {
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
  "36": "CULEBRA"
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

  for (
    const [numero, nombre]
    of Object.entries(animalesLotto)
  ) {

    if (
      normalizarTexto(nombre) ===
      buscado
    ) {
      return numero;
    }
  }

  return null;
}


function convertirFechaVenezuela(
  fecha,
  hora
) {

  const fechaLimpia =
    String(fecha || "").trim();

  const horaLimpia =
    String(hora || "").trim();

  if (
    !fechaLimpia ||
    !horaLimpia
  ) {
    return null;
  }

  let hora24 =
    horaLimpia;

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

    if (
      periodo === "PM" &&
      h !== 12
    ) {
      h += 12;
    }

    if (
      periodo === "AM" &&
      h === 12
    ) {
      h = 0;
    }

    hora24 =
      `${String(h).padStart(2, "0")}:${minutos}`;
  }

  return (
    `${fechaLimpia}T${hora24}:00${TZ}`
  );
}


function extraerNumero(texto) {

  const limpio =
    normalizarTexto(texto);

  const match =
    limpio.match(
      /\b(00|0|[1-9]|[1-2][0-9]|3[0-6])\b/
    );

  return match
    ? match[1]
    : null;
}


function extraerAnimalDesdeCelda(
  celda
) {

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
      `Fuente respondió ${respuesta.status}`
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

      if (
        filas.length < 2
      ) {
        return;
      }

      const encabezados = [];

      $(filas[0])
        .find("th,td")
        .each(
          (_, celda) => {

            encabezados.push(
              $(celda)
                .text()
                .trim()
            );
          }
        );

      const fechas =
        encabezados
          .map(obtenerFechaISO)
          .filter(Boolean);

      if (
        fechas.length === 0
      ) {
        return;
      }

      filas
        .slice(1)
        .each(
          (_, fila) => {

            const celdas =
              $(fila).find("td");

            if (
              celdas.length < 2
            ) {
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
                  normalizarTexto(
                    animal
                  ),
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


/*
==================================================
RESULTADOS VENEZUELA
COMPLEMENTO PARA AYER Y HOY
==================================================
*/

function obtenerFechaCaracas(
  fecha = new Date()
) {

  const partes =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "America/Caracas",
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit"
      }
    ).formatToParts(fecha);

  const valores = {};

  for (
    const parte of partes
  ) {
    if (
      parte.type !== "literal"
    ) {
      valores[parte.type] =
        parte.value;
    }
  }

  return (
    `${valores.year}-${valores.month}-${valores.day}`
  );
}


function restarDiasISO(
  fechaISO,
  dias
) {

  const fecha =
    new Date(
      `${fechaISO}T12:00:00${TZ}`
    );

  fecha.setUTCDate(
    fecha.getUTCDate() - dias
  );

  return fecha
    .toISOString()
    .slice(0, 10);
}


function extraerResultadosVenezuela(
  html,
  fechaEsperada
) {

  const $ =
    cheerio.load(html);

  const resultados = [];

  $("img[alt]").each(
    (_, imagen) => {

      const alt =
        String(
          $(imagen).attr("alt") || ""
        ).trim();

      const altNormalizado =
        normalizarTexto(alt);

      /*
      Solo aceptamos imágenes de Lotto Activo
      y rechazamos Lotto Activo RD / RDominicana.
      */

      if (
        !altNormalizado.startsWith(
          "ANIMALITO "
        )
      ) {
        return;
      }

      if (
        !altNormalizado.includes(
          " - LOTTO ACTIVO"
        )
      ) {
        return;
      }

      if (
        altNormalizado.includes(
          "LOTTO ACTIVO RD"
        )
      ) {
        return;
      }

      const match =
        alt.match(
          /^Animalito\s+(.+?)\s+número\s+(00|0|[0-9]{1,2})\s+-\s+Lotto Activo\b/i
        );

      if (!match) {
        return;
      }

      const animal =
        match[1]
          .trim();

      const numeroTexto =
        match[2];

      const numero =
        Number(numeroTexto);

      if (
        !Number.isInteger(numero) ||
        numero < 0 ||
        numero > 36
      ) {
        return;
      }

      let nodo =
        $(imagen);

      let hora =
        null;

      /*
      Subimos por el DOM hasta encontrar
      el bloque que contiene la hora.
      */

      for (
        let nivel = 0;
        nivel < 8;
        nivel++
      ) {

        nodo =
          nodo.parent();

        if (
          !nodo ||
          nodo.length === 0
        ) {
          break;
        }

        const texto =
          nodo.text()
            .replace(/\s+/g, " ")
            .trim();

        const horaMatch =
          texto.match(
            /\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/i
          );

        if (horaMatch) {

          hora =
            horaMatch[1];

          break;
        }
      }

      if (!hora) {
        return;
      }

      const fecha =
        convertirFechaVenezuela(
          fechaEsperada,
          hora
        );

      if (!fecha) {
        return;
      }

      resultados.push({

        animal:
          normalizarTexto(
            animal
          ),

        numero,

        fecha

      });

    }
  );

  return resultados;
}


async function obtenerResultadosVenezuela(
  fecha
) {

  const url =
    `${BASE_RESULTADOS_VENEZUELA}?date=${fecha}`;

  console.log(
    "Consultando Resultados Venezuela:",
    url
  );

  const html =
    await descargar(url);

  const resultados =
    extraerResultadosVenezuela(
      html,
      fecha
    );

  console.log(
    `Resultados Venezuela ${fecha}:`,
    resultados.length
  );

  return resultados;
}


function formatearFecha(
  fecha
) {

  return fecha
    .toISOString()
    .slice(0, 10);
}


function restarDias(
  fecha,
  dias
) {

  const nueva =
    new Date(fecha);

  nueva.setUTCDate(
    nueva.getUTCDate() - dias
  );

  return nueva;
}


function obtenerRangoDias() {

  const ahora =
    new Date();

  const fin =
    new Date(
      Date.UTC(
        ahora.getUTCFullYear(),
        ahora.getUTCMonth(),
        ahora.getUTCDate()
      )
    );

  const inicio =
    restarDias(
      fin,
      60
    );

  return {
    inicio,
    fin
  };
}


export default async function handler(
  req,
  res
) {

  try {

    /*
    ==================================================
    1. HISTORIAL PRINCIPAL — LOTOVEN
    ==================================================
    */

    const {
      inicio,
      fin
    } =
      obtenerRangoDias();

    const todosResultados = [];

    let fechaActual =
      new Date(inicio);

    while (
      fechaActual <= fin
    ) {

      const fechaInicio =
        formatearFecha(
          fechaActual
        );

      const fechaFinObjeto =
        new Date(
          fechaActual
        );

      fechaFinObjeto.setUTCDate(
        fechaFinObjeto.getUTCDate() + 6
      );

      if (
        fechaFinObjeto > fin
      ) {
        fechaFinObjeto.setTime(
          fin.getTime()
        );
      }

      const fechaFin =
        formatearFecha(
          fechaFinObjeto
        );

      const url =
        `${BASE}/historial/${fechaInicio}/${fechaFin}/`;

      console.log(
        "Consultando Lotto Activo:",
        url
      );

      try {

        const html =
          await descargar(url);

        const resultados =
          extraerResultados(html);

        console.log(
          `Resultados encontrados ${fechaInicio} al ${fechaFin}:`,
          resultados.length
        );

        todosResultados.push(
          ...resultados
        );

      } catch (error) {

        console.error(
          `Error consultando ${fechaInicio} al ${fechaFin}:`,
          error.message
        );
      }

      fechaActual =
        new Date(
          fechaFinObjeto
        );

      fechaActual.setUTCDate(
        fechaActual.getUTCDate() + 1
      );
    }


    /*
    ==================================================
    2. COMPLEMENTO — RESULTADOS VENEZUELA
    AYER + HOY EN HORA DE VENEZUELA
    ==================================================
    */

    const hoyVenezuela =
      obtenerFechaCaracas();

    const ayerVenezuela =
      restarDiasISO(
        hoyVenezuela,
        1
      );

    const fechasComplementarias = [
      ayerVenezuela,
      hoyVenezuela
    ];

    for (
      const fecha
      of fechasComplementarias
    ) {

      try {

        const resultados =
          await obtenerResultadosVenezuela(
            fecha
          );

        todosResultados.push(
          ...resultados
        );

      } catch (error) {

        console.error(
          `Error consultando Resultados Venezuela ${fecha}:`,
          error.message
        );
      }
    }


    /*
    ==================================================
    3. ELIMINAR DUPLICADOS
    ==================================================
    */

    const unicos =
      new Map();

    for (
      const resultado
      of todosResultados
    ) {

      const clave =
        `${resultado.animal}|${resultado.numero}|${resultado.fecha}`;

      unicos.set(
        clave,
        resultado
      );
    }

    const resultadosFinales =
      Array.from(
        unicos.values()
      );


    if (
      resultadosFinales.length === 0
    ) {

      throw new Error(
        "No se encontraron resultados de Lotto Activo."
      );
    }


    /*
    ==================================================
    4. GUARDAR EN SUPABASE
    ==================================================
    */

    await guardarResultadosLotto(
      resultadosFinales
    );


    /*
    ==================================================
    5. RESPUESTA
    ==================================================
    */

    const fechas =
      resultadosFinales
        .map(
          x => x.fecha
        )
        .sort();

    const tieneHoy =
      resultadosFinales.some(
        x =>
          x.fecha.startsWith(
            `${hoyVenezuela}T`
          )
      );

    const tieneAyer =
      resultadosFinales.some(
        x =>
          x.fecha.startsWith(
            `${ayerVenezuela}T`
          )
      );


    res.status(200).json({

      ok: true,

      loteria:
        "Lotto Activo",

      fuente:
        "LotoVen + Resultados Venezuela",

      encontrados:
        resultadosFinales.length,

      fechaMasAntigua:
        fechas[0] || null,

      fechaMasReciente:
        fechas[
          fechas.length - 1
        ] || null,

      hoyVenezuela,

      ayerVenezuela,

      resultadosHoy:
        tieneHoy,

      resultadosAyer:
        tieneAyer

    });


  } catch (error) {

    console.error(
      "ERROR ACTUALIZANDO LOTTO:",
      error
    );

    res.status(500).json({

      ok: false,

      error:
        error.message ||
        "Error actualizando Lotto Activo."

    });
  }
}
