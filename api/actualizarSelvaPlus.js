import * as cheerio from "cheerio";
import guardarResultadosSelvaPlus from "../lib/guardarResultadosSelvaPlus.js";
import supabase from "../lib/supabase.js";


/*
==================================================
LOTERÍA
==================================================
*/

const BASE =
  "https://lotoven.com/animalito/selvaplus";


/*
==================================================
NORMALIZAR TEXTO
==================================================
*/

function normalizar(texto) {

  return String(texto || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
==================================================
FECHA ISO
==================================================
*/

function fechaISO(fecha) {

  const d =
    new Date(fecha);

  const año =
    d.getUTCFullYear();

  const mes =
    String(
      d.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      d.getUTCDate()
    ).padStart(
      2,
      "0"
    );

  return `${año}-${mes}-${dia}`;

}


/*
==================================================
LUNES DE LA SEMANA
==================================================
*/

function lunesDeSemana(fecha) {

  const d =
    new Date(fecha);

  d.setUTCHours(
    0,
    0,
    0,
    0
  );

  const dia =
    d.getUTCDay();

  const diferencia =
    dia === 0
      ? -6
      : 1 - dia;

  d.setUTCDate(
    d.getUTCDate() +
    diferencia
  );

  return d;

}


/*
==================================================
SUMAR DÍAS
==================================================
*/

function sumarDias(
  fecha,
  dias
) {

  const d =
    new Date(fecha);

  d.setUTCDate(
    d.getUTCDate() +
    dias
  );

  return d;

}


/*
==================================================
OBTENER MAPA OFICIAL DE NÚMEROS
==================================================
*/

async function obtenerMapaNumeros() {

  const respuesta =
    await fetch(
      `${BASE}/estadisticas/`
    );

  if (!respuesta.ok) {

    throw new Error(
      "No se pudo obtener la tabla de animales de Selva Plus."
    );

  }

  const html =
    await respuesta.text();

  const $ =
    cheerio.load(html);

  const mapa = {};


  /*
  ----------------------------------------------
  MÉTODO PRINCIPAL
  ----------------------------------------------
  */

  $("tr").each(
    (_, fila) => {

      const celdas =
        $(fila)
          .find("th, td")
          .map(
            (_, celda) =>
              $(celda)
                .text()
                .replace(
                  /\s+/g,
                  " "
                )
                .trim()
          )
          .get();

      const texto =
        celdas.join(" ");

      const match =
        texto.match(
          /(?:Image)?\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúÑñüÜ ]+?)\s+(?:\d{4}-\d{2}-\d{2}|\d+\s*$)/i
        );

      if (!match) {
        return;
      }

      const numero =
        parseInt(
          match[1],
          10
        );

      const animal =
        normalizar(
          match[2]
        );

      if (animal) {

        mapa[animal] =
          numero;

      }

    }
  );


  /*
  ----------------------------------------------
  RESPALDO
  ----------------------------------------------
  */

  const textoCompleto =
    $("body")
      .text()
      .replace(
        /\s+/g,
        " "
      );


  const regex =
    /(?:^|\s)(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúÑñüÜ ]+?)(?=\s+\d{4}-\d{2}-\d{2}|\s+\d+\s|$)/gi;


  let m;


  while (
    (
      m =
        regex.exec(
          textoCompleto
        )
    ) !== null
  ) {

    const numero =
      parseInt(
        m[1],
        10
      );

    const animal =
      normalizar(
        m[2]
      );


    if (
      animal &&
      animal.length < 30 &&
      !animal.includes("ULTIMA") &&
      !animal.includes("DIAS") &&
      !animal.includes("ANIMALITO") &&
      !animal.includes("NUMERO")
    ) {

      mapa[animal] =
        numero;

    }

  }


  /*
  ----------------------------------------------
  VALIDACIÓN
  ----------------------------------------------
  */

  if (
    Object.keys(mapa).length < 30
  ) {

    throw new Error(
      "La tabla de Selva Plus no pudo ser identificada correctamente."
    );

  }


  return mapa;

}


/*
==================================================
OBTENER UNA SEMANA
==================================================
*/

async function obtenerSemana(
  fechaInicio,
  mapaNumeros
) {

  const inicio =
    fechaISO(
      fechaInicio
    );

  const fin =
    fechaISO(
      sumarDias(
        fechaInicio,
        6
      )
    );


  const url =
    `${BASE}/historial/${inicio}/${fin}/`;


  const respuesta =
    await fetch(url);


  if (!respuesta.ok) {

    throw new Error(
      `No se pudo obtener el historial de Selva Plus ${inicio} al ${fin}.`
    );

  }


  const html =
    await respuesta.text();

  const $ =
    cheerio.load(html);

  const resultados = [];


  /*
  ----------------------------------------------
  RECORRER TABLAS
  ----------------------------------------------
  */

  $("table").each(
    (_, tabla) => {

      const filas =
        $(tabla).find("tr");


      if (
        filas.length < 2
      ) {
        return;
      }


      /*
      --------------------------------------------
      ENCABEZADOS DE FECHA
      --------------------------------------------
      */

      const encabezados = [];


      $(filas[0])
        .find("th, td")
        .each(
          (i, celda) => {

            const texto =
              $(celda)
                .text()
                .replace(
                  /\s+/g,
                  " "
                )
                .trim();

            const match =
              texto.match(
                /^(\d{4}-\d{2}-\d{2})$/
              );

            if (match) {

              encabezados[i] =
                match[1];

            }

          }
        );


      if (
        encabezados.filter(Boolean)
          .length === 0
      ) {

        return;

      }


      /*
      --------------------------------------------
      FILAS DE HORARIOS
      --------------------------------------------
      */

      filas.slice(1).each(
        (_, fila) => {

          const celdas =
            $(fila).find(
              "th, td"
            );


          let hora = null;


          /*
          ----------------------------------------
          OBTENER HORA
          ----------------------------------------
          */

          celdas.each(
            (i, celda) => {

              if (i !== 0) {
                return;
              }

              const texto =
                $(celda)
                  .text()
                  .replace(
                    /\s+/g,
                    " "
                  )
                  .trim();


              const matchHora =
                texto.match(
                  /(\d{1,2}:\d{2})\s*(AM|PM)/i
                );


              if (matchHora) {

                hora =
                  `${matchHora[1]} ${matchHora[2].toUpperCase()}`;

              }

            }
          );


          if (!hora) {
            return;
          }


          /*
          ----------------------------------------
          RECORRER COLUMNAS
          ----------------------------------------
          */

          celdas.each(
            (i, celda) => {

              const fecha =
                encabezados[i];


              if (!fecha) {
                return;
              }


              /*
              --------------------------------------
              OBTENER ANIMAL DESDE IMG
              --------------------------------------
              */

              const imagen =
                $(celda)
                  .find("img")
                  .first();


              let animal = "";


              if (
                imagen.length
              ) {

                animal =
                  imagen.attr("alt") ||
                  imagen.attr("title") ||
                  "";

              }


              /*
              --------------------------------------
              RESPALDO POR TEXTO
              --------------------------------------
              */

              if (!animal) {

                animal =
                  $(celda)
                    .text()
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .trim();

              }


              animal =
                animal
                  .replace(
                    /^Image/i,
                    ""
                  )
                  .trim();


              if (!animal) {
                return;
              }


              animal =
                normalizar(
                  animal
                );


              /*
              --------------------------------------
              BUSCAR NÚMERO OFICIAL
              --------------------------------------
              */

              const numero =
                mapaNumeros[
                  animal
                ];


              if (
                numero === undefined
              ) {

                console.log(
                  `Selva Plus - animal sin número: ${animal}`
                );

                return;

              }


              /*
              --------------------------------------
              CONVERTIR HORA
              --------------------------------------
              */

              const partesHora =
                hora.match(
                  /(\d{1,2}):(\d{2})\s*(AM|PM)/i
                );


              if (!partesHora) {
                return;
              }


              let h =
                parseInt(
                  partesHora[1],
                  10
                );


              const minutos =
                partesHora[2];


              const periodo =
                partesHora[3]
                  .toUpperCase();


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


              /*
              --------------------------------------
              HORA VENEZUELA
              --------------------------------------
              */

              const fechaCompleta =
                `${fecha}T${String(h).padStart(2, "0")}:${minutos}:00-04:00`;


              resultados.push({

                animal,

                numero,

                fecha:
                  fechaCompleta

              });

            }
          );

        }
      );

    }
  );


  return resultados;

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

    /*
    ==========================================
    MAPA OFICIAL
    ==========================================
    */

    const mapaNumeros =
      await obtenerMapaNumeros();


    /*
    ==========================================
    FECHA ACTUAL
    ==========================================
    */

    const hoy =
      new Date();


    const lunesActual =
      lunesDeSemana(
        hoy
      );


    const resultadosTotales = [];


    /*
    ==========================================
    5 SEMANAS DE HISTORIAL
    ==========================================
    */

    for (
      let semana = 0;
      semana < 5;
      semana++
    ) {

      const inicio =
        sumarDias(
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


    /*
    ==========================================
    ELIMINAR DUPLICADOS
    ==========================================
    */

    const unicos =
      new Map();


    resultadosTotales.forEach(
      resultado => {

        const clave =
          `${resultado.animal}|${resultado.numero}|${resultado.fecha}`;


        unicos.set(
          clave,
          resultado
        );

      }
    );


    const resultados =
      [
        ...unicos.values()
      ];


    if (
      resultados.length === 0
    ) {

      throw new Error(
        "No se encontraron resultados históricos de Selva Plus."
      );

    }


    /*
    ==========================================
    GUARDAR EN TABLA PROPIA
    ==========================================
    */

    await guardarResultadosSelvaPlus(
      resultados
    );


    /*
    ==========================================
    LEER HISTORIAL PROPIO
    ==========================================
    */

    const {
      data: historial,
      error
    } =
      await supabase
        .from(
          "historial_selvaplus"
        )
        .select("*")
        .order(
          "fecha",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    /*
    ==========================================
    OBTENER FECHAS
    ==========================================
    */

    const fechas =
      [
        ...new Set(
          historial
            .map(
              r =>
                r.fecha
                  ? String(
                      r.fecha
                    ).substring(
                      0,
                      10
                    )
                  : null
            )
            .filter(Boolean)
        )
      ]
      .sort();


    /*
    ==========================================
    RESPUESTA
    ==========================================
    */

    return res.status(
      200
    ).json({

      ok: true,

      loteria:
        "Selva Plus",

      fuente:
        "LotoVen",

      animalesDetectados:
        Object.keys(
          mapaNumeros
        ).length,

      cargados:
        resultados.length,

      historialTotal:
        historial.length,

      fechasDiferentes:
        fechas.length,

      fechaMasAntigua:
        fechas[0] || null,

      fechaMasReciente:
        fechas[
          fechas.length - 1
        ] || null,

      ultimasFechas:
        fechas.slice(
          -10
        )

    });

  }


  catch (error) {

    console.error(
      "ERROR SELVA PLUS:",
      error
    );


    return res.status(
      500
    ).json({

      ok: false,

      error:
        error.message ||
        "Error interno de Selva Plus."

    });

  }

}
