/*
==================================================
XTREME PREDICTOR 2.0
ACTUALIZADOR DE CABALLOS
LA RINCONADA + VALENCIA
VERSIÓN BLOQUE DE TEXTO
==================================================
*/

import supabase from "../lib/supabase.js";


const FUENTES = [
  "https://hipicasenvivo.com/la-rinconda-hinava/"
];


const TIME_ZONE = "America/Caracas";


/*
==================================================
MESES
==================================================
*/

const MESES = {

  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,

  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12

};


/*
==================================================
FECHA VENEZUELA
==================================================
*/

function obtenerFechaVenezuela() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());

}


/*
==================================================
NORMALIZAR
==================================================
*/

function normalizarTexto(texto) {

  return String(texto || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}


/*
==================================================
OBTENER HTML
==================================================
*/

async function obtenerPagina(url) {

  const respuesta =
    await fetch(
      url,
      {
        headers: {

          "User-Agent":
            "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",

          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

          "Accept-Language":
            "es-VE,es;q=0.9,en;q=0.8"

        }
      }
    );


  if (!respuesta.ok) {

    throw new Error(
      `HTTP ${respuesta.status}`
    );

  }


  return await respuesta.text();

}


/*
==================================================
HTML → TEXTO
==================================================
*/

function obtenerTexto(html) {

  return html

    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )

    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )

    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      " "
    )

    .replace(
      /<br\s*\/?>/gi,
      " "
    )

    .replace(
      /<[^>]+>/g,
      " "
    )

    .replace(
      /&nbsp;/gi,
      " "
    )

    .replace(
      /&amp;/gi,
      "&"
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


/*
==================================================
CONVERTIR FECHA
==================================================
*/

function convertirFecha(
  mesTexto,
  diaTexto,
  añoTexto
) {

  const mes =
    MESES[
      String(mesTexto)
        .toLowerCase()
    ];


  const dia =
    Number(diaTexto);


  const año =
    Number(añoTexto);


  if (
    !mes ||
    !dia ||
    !año
  ) {

    return null;

  }


  return [

    año,

    String(mes)
      .padStart(2, "0"),

    String(dia)
      .padStart(2, "0")

  ].join("-");

}


/*
==================================================
DETECTAR HIPÓDROMO
==================================================
*/

function detectarHipodromo(
  texto
) {

  const t =
    texto
      .toUpperCase();


  if (
    t.includes(
      "NACIONAL DE VALENCIA"
    ) ||
    t.includes(
      "HIPÓDROMO DE VALENCIA"
    ) ||
    t.includes(
      "HIPODROMO DE VALENCIA"
    )
  ) {

    return "Valencia";

  }


  return "La Rinconada";

}


/*
==================================================
EXTRAER LLEGADAS DE UNA CARRERA
==================================================
*/

function extraerLlegadas(
  bloque
) {

  const resultados = [];


  /*
  ----------------------------------------------
  CADA LLEGADA:
  
  1º TINTA FINA (6) · VELIZ R WINDER J
  2º BULMA (4) · GONZALEZ YAMPER · 3 1/2
  ----------------------------------------------
  */

  const regex =
    /(?:🥇|🥈|🥉)?\s*(\d+)\s*º\s+(.+?)\s*\((\d+)\)\s*·\s*([^·]+?)(?:\s*·\s*([^D]+?))?(?=\s+(?:\d+\s*º|Dividendos:|Retirados:|$))/gi;


  let match;


  while (
    (match = regex.exec(bloque))
  ) {

    const posicion =
      Number(match[1]);


    const caballo =
      normalizarTexto(
        match[2]
      );


    const numero =
      Number(match[3]);


    let jinete =
      normalizarTexto(
        match[4]
      );


    let margen =
      match[5]
        ? normalizarTexto(
            match[5]
          )
        : null;


    /*
    ----------------------------------------------
    LIMPIAR MARGEN
    ----------------------------------------------
    */

    if (
      jinete
    ) {

      const margenPegado =
        jinete.match(
          /\s+(CABEZA|CUELLO|NARIZ|PESCUEZO|\d+(?:\s+\d+\/\d+)?(?:\s*(?:1\/2|1\/4|3\/4))?)$/i
        );


      if (
        margenPegado &&
        !margen
      ) {

        margen =
          margenPegado[1];


        jinete =
          jinete
            .replace(
              margenPegado[0],
              ""
            )
            .trim();

      }

    }


    if (
      caballo &&
      numero &&
      posicion
    ) {

      resultados.push({

        posicion,

        numero,

        caballo,

        jinete:
          jinete || null,

        margen:
          margen || null

      });

    }

  }


  return resultados;

}


/*
==================================================
EXTRAER RESULTADOS
==================================================
*/

function extraerResultados(
  html
) {

  const texto =
    obtenerTexto(html);


  const resultados = [];


  /*
  ==================================================
  LOCALIZAR BLOQUES DE RESULTADOS
  ==================================================
  */

  const regexBloques =
    /(?:([A-ZÁÉÍÓÚ]{3})\s+(\d{1,2})\s+(\d{4})\s+)?RESULTADOS\s+(LA RINCONADA|NACIONAL DE VALENCIA|VALENCIA)([\s\S]*?)(?=(?:[A-ZÁÉÍÓÚ]{3})\s+\d{1,2}\s+\d{4}\s+RESULTADOS|$)/gi;


  let bloqueMatch;


  while (
    (bloqueMatch =
      regexBloques.exec(texto))
  ) {

    const mes =
      bloqueMatch[1];

    const dia =
      bloqueMatch[2];

    const año =
      bloqueMatch[3];


    const hipodromoTexto =
      bloqueMatch[4];


    const contenido =
      bloqueMatch[5];


    let fecha =
      null;


    if (
      mes &&
      dia &&
      año
    ) {

      fecha =
        convertirFecha(
          mes,
          dia,
          año
        );

    }


    /*
    ----------------------------------------------
    SI NO ENCONTRÓ FECHA EN EL ENCABEZADO,
    BUSCAR FECHA COMPLETA
    ----------------------------------------------
    */

    if (!fecha) {

      const fechaCompleta =
        contenido.match(
          /(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo),?\s+(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i
        );


      if (
        fechaCompleta
      ) {

        const mesNombre =
          fechaCompleta[2]
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            );


        fecha =
          convertirFecha(
            mesNombre,
            fechaCompleta[1],
            fechaCompleta[3]
          );

      }

    }


    if (!fecha) {
      continue;
    }


    const hipodromo =
      detectarHipodromo(
        hipodromoTexto
      );


    /*
    ==================================================
    CARRERAS
    ==================================================
    */

    const regexCarrera =
      /Carrera\s+(\d+)\s+(\d+)\s*m(?:\s*⏱\s*[\d.]+)?\s*Llegada completa:\s*([\s\S]*?)(?=\s+Carrera\s+\d+\s+\d+\s*m|\s*$)/gi;


    let carreraMatch;


    while (
      (carreraMatch =
        regexCarrera.exec(
          contenido
        ))
    ) {

      const carrera =
        Number(
          carreraMatch[1]
        );


      const distancia =
        Number(
          carreraMatch[2]
        );


      const bloqueLlegada =
        carreraMatch[3];


      const llegadas =
        extraerLlegadas(
          bloqueLlegada
        );


      for (
        const llegada of
        llegadas
      ) {

        resultados.push({

          hipodromo,

          carrera,

          distancia,

          posicion:
            llegada.posicion,

          numero:
            llegada.numero,

          caballo:
            llegada.caballo,

          jinete:
            llegada.jinete,

          entrenador:
            null,

          peso:
            null,

          margen:
            llegada.margen,

          fecha

        });

      }

    }

  }


  return resultados;

}


/*
==================================================
ELIMINAR DUPLICADOS
==================================================
*/

function eliminarDuplicados(
  resultados
) {

  const mapa =
    new Map();


  for (
    const r of resultados
  ) {

    const clave = [

      r.hipodromo,

      r.carrera,

      r.numero,

      r.fecha

    ].join("|");


    if (
      !mapa.has(clave)
    ) {

      mapa.set(
        clave,
        r
      );

    }

  }


  return Array.from(
    mapa.values()
  );

}


/*
==================================================
PREPARAR SUPABASE
==================================================
*/

function prepararRegistros(
  resultados
) {

  return resultados.map(
    r => ({

      hipodromo:
        r.hipodromo,

      carrera:
        r.carrera,

      numero:
        r.numero,

      caballo:
        r.caballo,

      posicion:
        r.posicion,

      distancia:
        r.distancia,

      jinete:
        r.jinete,

      entrenador:
        r.entrenador,

      peso:
        r.peso,

      margen:
        r.margen,

      fecha:
        r.fecha,

      fecha_carrera:
        r.fecha

    })
  );

}


/*
==================================================
RESUMEN
==================================================
*/

function construirResumen(
  registros
) {

  const hipodromos =
    [
      ...new Set(
        registros.map(
          r => r.hipodromo
        )
      )
    ];


  const fechas =
    [
      ...new Set(
        registros.map(
          r => r.fecha_carrera
        )
      )
    ]
    .sort();


  const carrerasPorHipodromo =
    {};


  for (
    const r of registros
  ) {

    if (
      !carrerasPorHipodromo[
        r.hipodromo
      ]
    ) {

      carrerasPorHipodromo[
        r.hipodromo
      ] = [];

    }


    if (
      !carrerasPorHipodromo[
        r.hipodromo
      ].includes(
        r.carrera
      )
    ) {

      carrerasPorHipodromo[
        r.hipodromo
      ].push(
        r.carrera
      );

    }

  }


  for (
    const h of
    Object.keys(
      carrerasPorHipodromo
    )
  ) {

    carrerasPorHipodromo[h]
      .sort(
        (a, b) => a - b
      );

  }


  return {

    hipodromos,

    fechas,

    carrerasPorHipodromo

  };

}


/*
==================================================
HANDLER
==================================================
*/

export default async function handler(
  req,
  res
) {

  try {

    const fechaActual =
      obtenerFechaVenezuela();


    let resultados = [];

    let fuenteUtilizada =
      null;


    /*
    ----------------------------------------------
    CONSULTAR FUENTE
    ----------------------------------------------
    */

    for (
      const fuente of FUENTES
    ) {

      try {

        console.log(
          `Consultando: ${fuente}`
        );


        const html =
          await obtenerPagina(
            fuente
          );


        const encontrados =
          extraerResultados(
            html
          );


        console.log(
          `Caballos encontrados: ${encontrados.length}`
        );


        if (
          encontrados.length > 0
        ) {

          resultados =
            encontrados;

          fuenteUtilizada =
            fuente;

          break;

        }

      } catch (error) {

        console.error(
          "Error fuente:",
          error.message
        );

      }

    }


    resultados =
      eliminarDuplicados(
        resultados
      );


    /*
    ----------------------------------------------
    SIN RESULTADOS
    ----------------------------------------------
    */

    if (
      resultados.length === 0
    ) {

      return res
        .status(200)
        .json({

          ok: false,

          loteria:
            "Caballos",

          fecha:
            fechaActual,

          encontrados:
            0,

          mensaje:
            "La fuente respondió, pero no se pudieron estructurar las carreras y llegadas."

        });

    }


    /*
    ----------------------------------------------
    GUARDAR
    ----------------------------------------------
    */

    const registros =
      prepararRegistros(
        resultados
      );


    const {
      error
    } =
      await supabase
        .from(
          "historial_caballos"
        )
        .upsert(
          registros,
          {
            onConflict:
              "hipodromo,carrera,numero,fecha_carrera",

            ignoreDuplicates:
              false

          }
        );


    if (error) {

      throw error;

    }


    /*
    ----------------------------------------------
    RESUMEN
    ----------------------------------------------
    */

    const resumen =
      construirResumen(
        registros
      );


    /*
    ----------------------------------------------
    RESPUESTA
    ----------------------------------------------
    */

    return res
      .status(200)
      .json({

        ok: true,

        loteria:
          "Caballos",

        fuente:
          fuenteUtilizada,

        fechaActual,

        encontrados:
          registros.length,

        hipodromos:
          resumen.hipodromos,

        fechas:
          resumen.fechas,

        carrerasPorHipodromo:
          resumen.carrerasPorHipodromo,

        muestra:
          registros.slice(
            0,
            20
          )

      });


  } catch (error) {

    console.error(
      "ERROR actualizarCaballos:",
      error
    );


    return res
      .status(500)
      .json({

        ok: false,

        loteria:
          "Caballos",

        error:
          error?.message ||
          "Error actualizando caballos."

      });

  }

}
