import * as cheerio from "cheerio";
import guardarResultadosGuacharito from "../lib/guardarResultadosGuacharito.js";
import supabase from "../lib/supabase.js";


const BASE =
  "https://lotoven.com/animalito/elguacharitomillonario";


function normalizarTexto(texto) {

  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

}


function fechaISO(fecha, hora) {

  return `${fecha}T${hora}:00-04:00`;

}


function lunesDeSemana(fecha) {

  const d =
    new Date(
      `${fecha}T12:00:00-04:00`
    );

  const dia =
    d.getDay();

  const diferencia =
    dia === 0
      ? -6
      : 1 - dia;

  d.setDate(
    d.getDate() + diferencia
  );

  return d
    .toISOString()
    .slice(0, 10);

}


function sumarDias(fecha, dias) {

  const d =
    new Date(
      `${fecha}T12:00:00-04:00`
    );

  d.setDate(
    d.getDate() + dias
  );

  return d
    .toISOString()
    .slice(0, 10);

}


async function obtenerMapaNumeros() {

  const respuesta =
    await fetch(
      `${BASE}/estadisticas/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        }
      }
    );

  if (!respuesta.ok) {

    throw new Error(
      `Error obteniendo estadísticas: HTTP ${respuesta.status}`
    );

  }

  const html =
    await respuesta.text();

  const $ =
    cheerio.load(html);

  const mapa =
    {};

  $("tr").each(
    (_, tr) => {

      const celdas =
        $(tr)
          .find("td, th")
          .map(
            (_, td) =>
              normalizarTexto(
                $(td).text()
              )
          )
          .get();

      if (
        celdas.length < 2
      ) {
        return;
      }

      for (
        let i = 0;
        i < celdas.length - 1;
        i++
      ) {

        const numero =
          celdas[i]
            .match(
              /^\d{1,2}$/
            );

        if (!numero) {
          continue;
        }

        const animal =
          celdas[i + 1];

        if (
          animal &&
          animal.length >= 2
        ) {

          mapa[animal] =
            String(
              parseInt(
                numero[0],
                10
              )
            );

        }

      }

    }
  );


  /*
  ========================================
  RESPALDO DESDE TODO EL TEXTO
  ========================================
  */

  if (
    Object.keys(mapa).length < 30
  ) {

    const texto =
      normalizarTexto(
        $("body").text()
      );

    const encontrados =
      texto.matchAll(
        /(\d{1,2})\s+([A-Z][A-Z ]{2,})/g
      );

    for (
      const match of encontrados
    ) {

      const numero =
        String(
          parseInt(
            match[1],
            10
          )
        );

      const animal =
        normalizarTexto(
          match[2]
        );

      if (
        animal &&
        animal.length >= 2
      ) {

        mapa[animal] =
          numero;

      }

    }

  }


  if (
    Object.keys(mapa).length < 30
  ) {

    throw new Error(
      `No se pudo obtener el mapa de animales de El Guacharito. Encontrados: ${Object.keys(mapa).length}`
    );

  }


  console.log(
    `Mapa El Guacharito: ${Object.keys(mapa).length} animales`
  );


  return mapa;

}


async function obtenerSemana(
  fechaInicio,
  mapaNumeros
) {

  const fechaFin =
    sumarDias(
      fechaInicio,
      6
    );


  const url =
    `${BASE}/historial/${fechaInicio}/${fechaFin}/`;


  const respuesta =
    await fetch(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        }
      }
    );


  if (!respuesta.ok) {

    throw new Error(
      `Error historial ${fechaInicio}: HTTP ${respuesta.status}`
    );

  }


  const html =
    await respuesta.text();

  const $ =
    cheerio.load(html);


  const resultados =
    [];


  /*
  ========================================
  BUSCAR TABLAS DEL HISTORIAL
  ========================================
  */

  $("table").each(
    (_, table) => {

      const filas =
        $(table).find("tr");

      if (
        filas.length < 2
      ) {
        return;
      }


      /*
      ----------------------------------------
      FECHAS DE LAS COLUMNAS
      ----------------------------------------
      */

      const encabezado =
        $(filas[0])
          .find("th, td")
          .map(
            (_, celda) =>
              $(celda)
                .text()
                .trim()
          )
          .get();


      const fechas =
        encabezado.map(
          texto => {

            const match =
              texto.match(
                /(\d{4}-\d{2}-\d{2})/
              );

            return match
              ? match[1]
              : null;

          }
        );


      /*
      ----------------------------------------
      FILAS DE SORTEOS
      ----------------------------------------
      */

      filas.slice(1).each(
        (_, fila) => {

          const celdas =
            $(fila)
              .find("td, th");


          if (
            celdas.length < 2
          ) {
            return;
          }


          const horaTexto =
            $(celdas[0])
              .text()
              .trim();


          const horaMatch =
            horaTexto.match(
              /(\d{1,2}):(\d{2})\s*(AM|PM)/i
            );


          if (!horaMatch) {
            return;
          }


          let hora =
            parseInt(
              horaMatch[1],
              10
            );

          const minutos =
            horaMatch[2];

          const periodo =
            horaMatch[3]
              .toUpperCase();


          if (
            periodo === "PM" &&
            hora !== 12
          ) {

            hora += 12;

          }


          if (
            periodo === "AM" &&
            hora === 12
          ) {

            hora = 0;

          }


          const hora24 =
            `${String(hora).padStart(2, "0")}:${minutos}`;


          /*
          ----------------------------------------
          ANIMAL DE CADA FECHA
          ----------------------------------------
          */

          celdas.slice(1).each(
            (indice, celda) => {

              const fecha =
                fechas[indice + 1];


              if (!fecha) {
                return;
              }


              const imagen =
                $(celda)
                  .find("img")
                  .first();


              let animalTexto =
                "";


              if (
                imagen.length
              ) {

                animalTexto =
                  imagen.attr("alt") ||
                  imagen.attr("title") ||
                  "";

              }


              if (
                !animalTexto
              ) {

                animalTexto =
                  $(celda)
                    .text()
                    .trim();

              }


              const animal =
                normalizarTexto(
                  animalTexto
                );


              if (!animal) {
                return;
              }


              const numero =
                mapaNumeros[animal];


              if (
                numero === undefined
              ) {

                console.log(
                  `Animal sin número: ${animal}`
                );

                return;

              }


              resultados.push({

                animal,

                numero,

                fecha:
                  fechaISO(
                    fecha,
                    hora24
                  )

              });

            }
          );

        }
      );

    }
  );


  /*
  ========================================
  RESPALDO SI EL HTML TIENE OTRA ESTRUCTURA
  ========================================
  */

  if (
    resultados.length === 0
  ) {

    console.log(
      `Sin resultados en estructura principal para ${fechaInicio}`
    );

  }


  return resultados;

}


export default async function handler(
  req,
  res
) {

  try {

    /*
    ========================================
    MAPA OFICIAL DE ANIMALES
    ========================================
    */

    const mapaNumeros =
      await obtenerMapaNumeros();


    /*
    ========================================
    FECHA ACTUAL EN VENEZUELA
    ========================================
    */

    const hoy =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Caracas",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).format(
        new Date()
      );


    const lunesActual =
      lunesDeSemana(
        hoy
      );


    /*
    ========================================
    CARGAR 5 SEMANAS
    ========================================
    */

    const resultados =
      [];


    const vistos =
      new Set();


    for (
      let semana = 0;
      semana < 5;
      semana++
    ) {

      const inicio =
        sumarDias(
          lunesActual,
          -7 * semana
        );


      console.log(
        `Descargando El Guacharito: ${inicio}`
      );


      const semanaResultados =
        await obtenerSemana(
          inicio,
          mapaNumeros
        );


      for (
        const resultado of semanaResultados
      ) {

        const clave =
          `${resultado.animal}|${resultado.numero}|${resultado.fecha}`;


        if (
          vistos.has(clave)
        ) {
          continue;
        }


        vistos.add(clave);

        resultados.push(
          resultado
        );

      }

    }


    /*
    ========================================
    GUARDAR EN SUPABASE
    ========================================
    */

    await guardarResultadosGuacharito(
      resultados
    );


    /*
    ========================================
    COMPROBAR HISTORIAL
    ========================================
    */

    const {
      count,
      error
    } =
      await supabase
        .from(
          "historial_guacharito"
        )
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (error) {
      throw error;
    }


    /*
    ========================================
    RESPUESTA
    ========================================
    */

    return res.status(200).json({

      ok: true,

      loteria:
        "El Guacharito Millonario",

      fuente:
        "LotoVen",

      encontrados:
        resultados.length,

      historial:
        count || 0,

      fechaMasAntigua:
        resultados.length
          ? resultados
              .map(
                r => r.fecha
              )
              .sort()[0]
          : null,

      fechaMasReciente:
        resultados.length
          ? resultados
              .map(
                r => r.fecha
              )
              .sort()
              .slice(-1)[0]
          : null

    });

  }

  catch (error) {

    console.error(
      "ERROR ACTUALIZAR GUACHARITO:",
      error
    );


    return res.status(500).json({

      ok: false,

      error:
        error.message ||
        "Error interno de El Guacharito Millonario"

    });

  }

}
