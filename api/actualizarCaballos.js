/*
==================================================
XTREME PREDICTOR 2.0
DIAGNÓSTICO ACTUALIZADOR DE CABALLOS
==================================================
*/

const FUENTE =
  "https://hipicasenvivo.com/la-rinconda-hinava/";


async function obtenerPagina(url) {

  const respuesta = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",

      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

      "Accept-Language":
        "es-VE,es;q=0.9,en;q=0.8"
    }
  });

  const html = await respuesta.text();

  return {
    status: respuesta.status,
    ok: respuesta.ok,
    html
  };

}


export default async function handler(req, res) {

  try {

    const resultado =
      await obtenerPagina(FUENTE);

    const html =
      resultado.html || "";


    const texto =
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    const buscar = texto.toUpperCase();


    return res.status(200).json({

      ok: true,

      fuente: FUENTE,

      httpStatus:
        resultado.status,

      caracteresHTML:
        html.length,

      caracteresTexto:
        texto.length,

      contieneRinconada:
        buscar.includes("LA RINCONADA"),

      contieneValencia:
        buscar.includes("VALENCIA"),

      contieneCarrera:
        buscar.includes("CARRERA"),

      contieneResultados:
        buscar.includes("RESULTADOS"),

      contieneTintaFina:
        buscar.includes("TINTA FINA"),

      contieneDomingo:
        buscar.includes("DOMINGO"),

      contieneSeptiembre:
        buscar.includes("SEPTIEMBRE"),

      contieneSEP:
        buscar.includes("SEP"),

      muestraInicio:
        texto.substring(0, 1500),

      muestraRinconada:
        (() => {

          const indice =
            buscar.indexOf(
              "LA RINCONADA"
            );

          if (indice === -1) {
            return null;
          }

          return texto.substring(
            Math.max(0, indice - 300),
            indice + 2500
          );

        })()

    });


  } catch (error) {

    return res.status(500).json({

      ok: false,

      error:
        error?.message ||
        "Error obteniendo la fuente."

    });

  }

}
