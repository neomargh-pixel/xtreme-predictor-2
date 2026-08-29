
/*
==================================================
XTREME PREDICTOR 2.0
ANÁLISIS SELVA PLUS
==================================================
*/

const { supabase } =
  require("../lib/supabase");


/*
==================================================
ANIMALES SELVA PLUS
38 ANIMALITOS
00 + 0 AL 36
==================================================
*/

const ANIMALES = [

  { numero: "00", animal: "BALLENA" },

  { numero: "0", animal: "DELFÍN" },

  { numero: "1", animal: "CARNERO" },
  { numero: "2", animal: "TORO" },
  { numero: "3", animal: "CIEMPIÉS" },
  { numero: "4", animal: "ALACRÁN" },
  { numero: "5", animal: "LEÓN" },
  { numero: "6", animal: "RANA" },
  { numero: "7", animal: "PERICO" },
  { numero: "8", animal: "RATÓN" },
  { numero: "9", animal: "ÁGUILA" },
  { numero: "10", animal: "TIGRE" },
  { numero: "11", animal: "GATO" },
  { numero: "12", animal: "CABALLO" },
  { numero: "13", animal: "MONO" },
  { numero: "14", animal: "PALOMA" },
  { numero: "15", animal: "ZORRO" },
  { numero: "16", animal: "OSO" },
  { numero: "17", animal: "PAVO" },
  { numero: "18", animal: "BURRO" },
  { numero: "19", animal: "CHIVO" },
  { numero: "20", animal: "COCHINO" },
  { numero: "21", animal: "GALLO" },
  { numero: "22", animal: "CAMELLO" },
  { numero: "23", animal: "CEBRA" },
  { numero: "24", animal: "IGUANA" },
  { numero: "25", animal: "GALLINA" },
  { numero: "26", animal: "VACA" },
  { numero: "27", animal: "PERRO" },
  { numero: "28", animal: "ZAMURO" },
  { numero: "29", animal: "ELEFANTE" },
  { numero: "30", animal: "CAIMÁN" },
  { numero: "31", animal: "LAPA" },
  { numero: "32", animal: "ARDILLA" },
  { numero: "33", animal: "PESCADO" },
  { numero: "34", animal: "VENADO" },
  { numero: "35", animal: "JIRAFA" },
  { numero: "36", animal: "CULEBRA" },
  { numero: "37", animal: "TORTUGA" }

];


/*
==================================================
NORMALIZAR
==================================================
*/

function normalizar(
  valor
) {

  return String(
    valor ?? ""
  )
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    );

}


/*
==================================================
CARGAR HISTORIAL
==================================================
*/

async function cargarHistorial() {

  let todos = [];

  let desde = 0;

  const limite = 1000;


  while (true) {

    const {
      data,
      error
    } =
      await supabase
        .from(
          "historial_selvaplus"
        )
        .select(
          "*"
        )
        .order(
          "fecha",
          {
            ascending: true
          }
        )
        .range(
          desde,
          desde + limite - 1
        );


    if (error) {

      throw new Error(
        error.message
      );

    }


    if (
      !data ||
      data.length === 0
    ) {

      break;

    }


    todos.push(
      ...data
    );


    if (
      data.length < limite
    ) {

      break;

    }


    desde += limite;

  }


  return todos;

}


/*
==================================================
FECHA ACTUAL
==================================================
*/

function fechaHoy() {

  const ahora =
    new Date();

  return (
    ahora
      .toISOString()
      .slice(0, 10)
  );

}


/*
==================================================
DÍAS SIN SALIR
==================================================
*/

function diasEntre(
  fecha1,
  fecha2
) {

  const a =
    new Date(
      fecha1 +
      "T00:00:00"
    );

  const b =
    new Date(
      fecha2 +
      "T00:00:00"
    );

  return Math.max(
    0,
    Math.floor(
      (
        b - a
      ) /
      86400000
    )
  );

}


/*
==================================================
ÍNDICE XTREME
==================================================
*/

function calcularIndice(
  salidas7,
  salidas14,
  salidas30,
  diasSinSalir
) {

  let indice = 0;


  indice +=
    salidas7 * 8;


  indice +=
    salidas14 * 3;


  indice +=
    salidas30 * 1;


  indice +=
    Math.min(
      diasSinSalir * 2,
      20
    );


  return Math.min(
    100,
    Math.round(
      indice
    )
  );

}


/*
==================================================
TENDENCIA
==================================================
*/

function obtenerTendencia(
  indice
) {

  if (
    indice >= 80
  ) {

    return "MUY ALTA";

  }

  if (
    indice >= 60
  ) {

    return "ALTA";

  }

  if (
    indice >= 40
  ) {

    return "MEDIA";

  }

  if (
    indice >= 20
  ) {

    return "NORMAL";

  }

  return "BAJA";

}


/*
==================================================
ANALIZAR
==================================================
*/

module.exports =
  async function handler(
    req,
    res
  ) {

    try {

      const historial =
        await cargarHistorial();


      const hoy =
        fechaHoy();


      const animales =
        ANIMALES.map(
          base => {

            const nombre =
              normalizar(
                base.animal
              );


            const registros =
              historial
                .filter(
                  r =>
                    normalizar(
                      r.animal
                    ) === nombre
                );


            const fechas =
              [
                ...new Set(
                  registros
                    .map(
                      r =>
                        String(
                          r.fecha
                        )
                          .slice(
                            0,
                            10
                          )
                    )
                )
              ]
              .sort();


            const ultimaFecha =
              fechas.length
                ? fechas[
                    fechas.length - 1
                  ]
                : null;


            const diasSinSalir =
              ultimaFecha
                ? diasEntre(
                    ultimaFecha,
                    hoy
                  )
                : 999;


            const salidas7 =
              fechas.filter(
                f =>
                  diasEntre(
                    f,
                    hoy
                  ) <= 7
              ).length;


            const salidas14 =
              fechas.filter(
                f =>
                  diasEntre(
                    f,
                    hoy
                  ) <= 14
              ).length;


            const salidas30 =
              fechas.filter(
                f =>
                  diasEntre(
                    f,
                    hoy
                  ) <= 30
              ).length;


            const salidas =
              fechas.length;


            const indice =
              calcularIndice(
                salidas7,
                salidas14,
                salidas30,
                diasSinSalir
              );


            return {

              animal:
                base.animal,

              numero:
                base.numero,

              salidas,

              fechas,

              ultimaFecha,

              diasSinSalir,

              salidas7,

              salidas14,

              salidas30,

              indice,

              porcentaje:
                Math.max(
                  50,
                  Math.min(
                    95,
                    indice + 20
                  )
                ),

              tendencia:
                obtenerTendencia(
                  indice
                )

            };

          }
        );


      /*
      ==============================================
      TOP 10
      ==============================================
      */

      const top10 =
        [...animales]
          .sort(
            (a, b) =>
              b.indice -
              a.indice
          )
          .slice(
            0,
            10
          );


      /*
      ==============================================
      ATRASADOS
      ==============================================
      */

      const atrasados =
        [...animales]
          .filter(
            a =>
              a.diasSinSalir >= 7
          )
          .sort(
            (a, b) =>
              b.diasSinSalir -
              a.diasSinSalir
          )
          .slice(
            0,
            5
          );


      /*
      ==============================================
      PRONÓSTICOS
      ==============================================
      */

      const pronosticos =
        [...animales]
          .filter(
            a =>
              a.diasSinSalir > 0
          )
          .sort(
            (a, b) =>
              b.indice -
              a.indice
          )
          .slice(
            0,
            3
          )
          .map(
            a => ({
              ...a,

              pronostico:
                true,

              categoria:
                "PRONÓSTICO"
            })
          );


      /*
      ==============================================
      RESULTADOS DE HOY
      ==============================================
      */

      const resultadosHoy = {};


      historial
        .filter(
          r =>
            String(
              r.fecha
            ).slice(
              0,
              10
            ) === hoy
        )
        .forEach(
          r => {

            const nombre =
              r.animal;


            if (
              !resultadosHoy[
                nombre
              ]
            ) {

              resultadosHoy[
                nombre
              ] = [];

            }


            resultadosHoy[
              nombre
            ].push({

              numero:
                r.numero,

              hora:
                r.hora,

              fecha:
                r.fecha

            });

          }
        );


      /*
      ==============================================
      RESPUESTA
      ==============================================
      */

      return res.status(
        200
      ).json({

        ok: true,

        loteria:
          "Selva Plus",

        fuente:
          "LotoVen",

        historial:
          historial.length,

        hoy,

        pronosticos,

        pronostico:
          pronosticos[0] ||
          null,

        top10,

        atrasados,

        resultadosHoy,

        estadisticas: {

          totalAnimales:
            ANIMALES.length,

          totalHistorial:
            historial.length,

          totalAtrasados:
            atrasados.length,

          mayorAtraso:
            atrasados[0]
              ?.animal ||
            "N/A",

          diasMayorAtraso:
            atrasados[0]
              ?.diasSinSalir ||
            0,

          candidatosPronostico:
            animales.length,

          pronosticosHoy:
            pronosticos.length,

          pronosticoActual:
            pronosticos
              .map(
                a =>
                  a.animal
              )
              .join(
                " • "
              ),

          diasPronostico:
            pronosticos[0]
              ?.diasSinSalir ||
            0

        }

      });

    }

    catch (error) {

      console.error(
        "ERROR ANALIZANDO SELVA PLUS:",
        error
      );


      return res.status(
        500
      ).json({

        ok: false,

        error:
          error.message

      });

    }

  };
