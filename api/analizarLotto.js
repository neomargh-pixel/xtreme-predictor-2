import supabase from "../lib/supabase.js";

const animalesLotto = [

  { numero:"00", animal:"BALLENA" },
  { numero:"0", animal:"DELFIN" },

  { numero:"01", animal:"CARNERO" },
  { numero:"02", animal:"TORO" },
  { numero:"03", animal:"CIEMPIES" },
  { numero:"04", animal:"ALACRAN" },
  { numero:"05", animal:"LEON" },
  { numero:"06", animal:"RANA" },
  { numero:"07", animal:"PERICO" },
  { numero:"08", animal:"RATON" },
  { numero:"09", animal:"AGUILA" },

  { numero:"10", animal:"TIGRE" },
  { numero:"11", animal:"GATO" },
  { numero:"12", animal:"CABALLO" },
  { numero:"13", animal:"MONO" },
  { numero:"14", animal:"PALOMA" },
  { numero:"15", animal:"ZORRO" },
  { numero:"16", animal:"OSO" },
  { numero:"17", animal:"PAVO" },
  { numero:"18", animal:"BURRO" },
  { numero:"19", animal:"CHIVO" },

  { numero:"20", animal:"COCHINO" },
  { numero:"21", animal:"GALLO" },
  { numero:"22", animal:"CAMELLO" },
  { numero:"23", animal:"CEBRA" },
  { numero:"24", animal:"IGUANA" },
  { numero:"25", animal:"GALLINA" },
  { numero:"26", animal:"VACA" },
  { numero:"27", animal:"PERRO" },
  { numero:"28", animal:"ZAMURO" },
  { numero:"29", animal:"ELEFANTE" },

  { numero:"30", animal:"CAIMAN" },
  { numero:"31", animal:"LAPA" },
  { numero:"32", animal:"ARDILLA" },
  { numero:"33", animal:"PESCADO" },
  { numero:"34", animal:"VENADO" },
  { numero:"35", animal:"JIRAFA" },
  { numero:"36", animal:"CULEBRA" }

];


function obtenerDiaVenezuela(fecha) {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "America/Caracas",
      year:"numeric",
      month:"2-digit",
      day:"2-digit"
    }
  ).format(
    new Date(fecha)
  );
}


function calcularDiasSinSalir(
  historial,
  animal
) {

  const fechas =
    historial
      .filter(
        x =>
          x.animal ===
          animal
      )
      .map(
        x =>
          obtenerDiaVenezuela(
            x.fecha
          )
      );

  if (
    fechas.length === 0
  ) {
    return null;
  }

  const unicas =
    [...new Set(fechas)]
      .sort()
      .reverse();

  const ultimaFecha =
    unicas[0];

  const hoy =
    obtenerDiaVenezuela(
      new Date()
    );

  const ultima =
    new Date(
      `${ultimaFecha}T00:00:00-04:00`
    );

  const actual =
    new Date(
      `${hoy}T00:00:00-04:00`
    );

  return Math.max(
    0,
    Math.floor(
      (
        actual.getTime() -
        ultima.getTime()
      ) /
      86400000
    )
  );
}


function calcularEstadisticas(
  historial,
  animal
) {

  const ahora =
    new Date();

  const hace7 =
    new Date(
      ahora.getTime() -
      7 * 86400000
    );

  const hace14 =
    new Date(
      ahora.getTime() -
      14 * 86400000
    );

  const hace30 =
    new Date(
      ahora.getTime() -
      30 * 86400000
    );

  const registros =
    historial.filter(
      x =>
        x.animal ===
        animal
    );

  const salidas =
    registros.length;

  const salidas7 =
    registros.filter(
      x =>
        new Date(x.fecha) >=
        hace7
    ).length;

  const salidas14 =
    registros.filter(
      x =>
        new Date(x.fecha) >=
        hace14
    ).length;

  const salidas30 =
    registros.filter(
      x =>
        new Date(x.fecha) >=
        hace30
    ).length;

  const diasSinSalir =
    calcularDiasSinSalir(
      historial,
      animal
    );

  let indice = 0;

  if (
    salidas30 > 0
  ) {
    indice +=
      Math.min(
        salidas30 * 3,
        45
      );
  }

  if (
    salidas14 > 0
  ) {
    indice +=
      Math.min(
        salidas14 * 2,
        25
      );
  }

  if (
    salidas7 > 0
  ) {
    indice +=
      Math.min(
        salidas7 * 2,
        15
      );
  }

  if (
    diasSinSalir !== null
  ) {
    indice +=
      Math.min(
        diasSinSalir * 2,
        15
      );
  }

  indice =
    Math.min(
      Math.round(indice),
      100
    );

  let tendencia =
    "NORMAL";

  if (
    indice >= 90
  ) {
    tendencia =
      "MUY ALTA";
  } else if (
    indice >= 75
  ) {
    tendencia =
      "ALTA";
  } else if (
    indice >= 55
  ) {
    tendencia =
      "MEDIA";
  } else if (
    indice >= 35
  ) {
    tendencia =
      "BAJA";
  } else {
    tendencia =
      "MUY BAJA";
  }

  let estado =
    "NORMAL";

  if (
    diasSinSalir !== null &&
    diasSinSalir >= 7
  ) {
    estado =
      "ATRASADO";
  } else if (
    salidas7 >= 2
  ) {
    estado =
      "CALIENTE";
  }

  return {

    numero:
      animal.numero,

    animal:
      animal.animal,

    salidas,

    salidas7,

    salidas14,

    salidas30,

    diasSinSalir,

    indice,

    porcentaje:
      indice,

    tendencia,

    estado

  };
}


export default async function handler(
  req,
  res
) {

  try {

    const {
      data,
      error
    } =
      await supabase
        .from(
          "historial_lotto"
        )
        .select(
          "animal,numero,fecha"
        )
        .order(
          "fecha",
          {
            ascending:false
          }
        );

    if (error) {
      throw error;
    }

    const historial =
      data || [];

    const estadisticas =
      animalesLotto.map(
        animal =>
          calcularEstadisticas(
            historial,
            animal
          )
      );

    const ordenados =
      [...estadisticas]
        .sort(
          (a,b) =>
            b.indice -
            a.indice
        );

    const pronosticos =
      ordenados.slice(
        0,
        3
      );

    const top10 =
      ordenados.slice(
        0,
        10
      );

    const atrasados =
      [...estadisticas]
        .filter(
          x =>
            x.diasSinSalir !== null &&
            x.diasSinSalir >= 7
        )
        .sort(
          (a,b) =>
            b.diasSinSalir -
            a.diasSinSalir
        );

    const mayorAtraso =
      atrasados.length
        ? atrasados[0]
        : null;

    const hoy =
      obtenerDiaVenezuela(
        new Date()
      );

    const resultadosHoy = {};

    historial
      .filter(
        x =>
          obtenerDiaVenezuela(
            x.fecha
          ) === hoy
      )
      .forEach(
        x => {

          resultadosHoy[
            x.fecha
          ] = {

            numero:
              x.numero,

            animal:
              x.animal,

            fecha:
              x.fecha

          };

        }
      );


    res.status(200).json({

      ok:true,

      loteria:
        "Lotto Activo",

      historial:
        historial.length,

      totalAnimales:
        animalesLotto.length,

      totalAtrasados:
        atrasados.length,

      mayorAtraso:
        mayorAtraso
          ? mayorAtraso.animal
          : null,

      diasMayorAtraso:
        mayorAtraso
          ? mayorAtraso.diasSinSalir
          : 0,

      pronosticos,

      top10,

      atrasados,

      resultadosHoy

    });


  } catch (error) {

    console.error(
      "ERROR ANALIZANDO LOTTO:",
      error
    );

    res.status(500).json({

      ok:false,

      error:
        error.message ||
        "Error analizando Lotto Activo."

    });

  }

}
