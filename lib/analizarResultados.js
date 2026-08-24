/*
==========================================
XTREME PREDICTOR
ANALIZADOR DIARIO DE LOS 77 ANIMALITOS
==========================================
*/

export default function analizarResultados(historial) {

  /*
  ==========================================
  LOS 77 ANIMALITOS OFICIALES
  ==========================================
  */

  const animalesOficiales = [

    { numero: "0", animal: "DELFÍN" },
    { numero: "00", animal: "BALLENA" },

    { numero: "01", animal: "CARNERO" },
    { numero: "02", animal: "TORO" },
    { numero: "03", animal: "CIEMPIÉS" },
    { numero: "04", animal: "ALACRÁN" },
    { numero: "05", animal: "LEÓN" },
    { numero: "06", animal: "RANA" },
    { numero: "07", animal: "PERICO" },
    { numero: "08", animal: "RATÓN" },
    { numero: "09", animal: "ÁGUILA" },

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
    { numero: "37", animal: "TORTUGA" },
    { numero: "38", animal: "BÚFALO" },
    { numero: "39", animal: "LECHUZA" },

    { numero: "40", animal: "AVISPA" },
    { numero: "41", animal: "CANGURO" },
    { numero: "42", animal: "TUCÁN" },
    { numero: "43", animal: "MARIPOSA" },
    { numero: "44", animal: "CHIGÜIRE" },
    { numero: "45", animal: "GARZA" },
    { numero: "46", animal: "PUMA" },
    { numero: "47", animal: "PAVO REAL" },
    { numero: "48", animal: "PUERCOESPÍN" },
    { numero: "49", animal: "PEREZA" },

    { numero: "50", animal: "CANARIO" },
    { numero: "51", animal: "PELÍCANO" },
    { numero: "52", animal: "PULPO" },
    { numero: "53", animal: "CARACOL" },
    { numero: "54", animal: "GRILLO" },
    { numero: "55", animal: "OSO HORMIGUERO" },
    { numero: "56", animal: "TIBURÓN" },
    { numero: "57", animal: "PATO" },
    { numero: "58", animal: "HORMIGA" },
    { numero: "59", animal: "PANTERA" },

    { numero: "60", animal: "CAMALEÓN" },
    { numero: "61", animal: "PANDA" },
    { numero: "62", animal: "CACHICAMO" },
    { numero: "63", animal: "CANGREJO" },
    { numero: "64", animal: "GAVILÁN" },
    { numero: "65", animal: "ARAÑA" },
    { numero: "66", animal: "LOBO" },
    { numero: "67", animal: "AVESTRUZ" },
    { numero: "68", animal: "JAGUAR" },
    { numero: "69", animal: "CONEJO" },

    { numero: "70", animal: "BISONTE" },
    { numero: "71", animal: "GUACAMAYA" },
    { numero: "72", animal: "GORILA" },
    { numero: "73", animal: "HIPOPÓTAMO" },
    { numero: "74", animal: "TURPIAL" },
    { numero: "75", animal: "GUÁCHARO" }

  ];


  /*
  ==========================================
  RESULTADO SIN DATOS
  ==========================================
  */

  function resultadoSinDatos() {

    return animalesOficiales.map(a => ({

      numero: a.numero,
      animal: a.animal,

      salidas: 0,
      salidas30: 0,
      salidas14: 0,
      salidas7: 0,

      ultimaFecha: null,
      diasSinSalir: 0,

      indice: 0,
      porcentaje: 0,

      tendencia: "BAJA",
      categoria: "SIN DATOS",

      pronostico: false

    }));

  }


  if (
    !Array.isArray(historial) ||
    historial.length === 0
  ) {

    return resultadoSinDatos();

  }


  /*
  ==========================================
  NORMALIZAR ANIMAL
  ==========================================
  */

  function normalizarAnimal(valor) {

    if (
      valor === null ||
      valor === undefined
    ) {

      return "";

    }

    return String(valor)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  }


  /*
  ==========================================
  NORMALIZAR FECHA
  ==========================================
  */

  function obtenerFecha(valor) {

    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {

      return null;

    }

    const texto =
      String(valor).trim();


    /*
    ------------------------------------------
    FORMATO YYYY-MM-DD
    ------------------------------------------
    */

    const iso =
      texto.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );


    if (iso) {

      return (
        iso[1] +
        "-" +
        iso[2] +
        "-" +
        iso[3]
      );

    }


    /*
    ------------------------------------------
    FORMATO DD/MM/YYYY
    ------------------------------------------
    */

    const latino =
      texto.match(
        /^(\d{2})\/(\d{2})\/(\d{4})/
      );


    if (latino) {

      return (
        latino[3] +
        "-" +
        latino[2] +
        "-" +
        latino[1]
      );

    }


    /*
    ------------------------------------------
    FECHA JAVASCRIPT
    ------------------------------------------
    */

    const fecha =
      new Date(texto);


    if (
      isNaN(
        fecha.getTime()
      )
    ) {

      return null;

    }


    return fecha
      .toISOString()
      .slice(0, 10);

  }


  /*
  ==========================================
  CONVERTIR FECHA A NÚMERO
  ==========================================
  */

  function fechaNumero(fecha) {

    if (!fecha) {
      return NaN;
    }

    const partes =
      String(fecha)
        .split("-")
        .map(Number);

    if (
      partes.length !== 3 ||
      partes.some(
        n => !Number.isFinite(n)
      )
    ) {

      return NaN;

    }

    return Date.UTC(
      partes[0],
      partes[1] - 1,
      partes[2]
    );

  }


  /*
  ==========================================
  DIFERENCIA DE DÍAS
  ==========================================
  */

  function diferenciaDias(
    fechaInicio,
    fechaFin
  ) {

    const inicio =
      fechaNumero(
        fechaInicio
      );

    const fin =
      fechaNumero(
        fechaFin
      );


    if (
      !Number.isFinite(inicio) ||
      !Number.isFinite(fin)
    ) {

      return 0;

    }


    return Math.max(
      0,
      Math.floor(
        (
          fin -
          inicio
        ) /
        86400000
      )
    );

  }


  /*
  ==========================================
  MAPA OFICIAL
  ==========================================
  */

  const mapaOficial =
    new Map();


  animalesOficiales.forEach(
    animal => {

      mapaOficial.set(
        normalizarAnimal(
          animal.animal
        ),
        animal
      );

    }
  );


  /*
  ==========================================
  PREPARAR HISTORIAL
  ==========================================
  */

  const registros =
    historial
      .map(registro => {

        const fecha =
          obtenerFecha(
            registro.fecha
          );


        const nombre =
          normalizarAnimal(
            registro.animal
          );


        if (
          !fecha ||
          !nombre
        ) {

          return null;

        }


        const oficial =
          mapaOficial.get(
            nombre
          );


        if (!oficial) {

          return null;

        }


        return {

          animalClave:
            nombre,

          animal:
            oficial.animal,

          numero:
            oficial.numero,

          fecha

        };

      })
      .filter(Boolean);


  /*
  ==========================================
  SIN REGISTROS VÁLIDOS
  ==========================================
  */

  if (
    registros.length === 0
  ) {

    return resultadoSinDatos();

  }


  /*
  ==========================================
  FECHA REAL MÁS RECIENTE
  ==========================================
  */

  const fechas =
    registros
      .map(
        r => r.fecha
      )
      .filter(Boolean)
      .sort();


  const fechaReferencia =
    fechas[
      fechas.length - 1
    ];


  /*
  ==========================================
  FECHAS DE CORTE
  ==========================================

  7 DÍAS:
  FECHA ACTUAL + LOS 6 DÍAS ANTERIORES

  14 DÍAS:
  FECHA ACTUAL + LOS 13 ANTERIORES

  30 DÍAS:
  FECHA ACTUAL + LOS 29 ANTERIORES
  ==========================================
  */

  const fechaReferenciaNumero =
    fechaNumero(
      fechaReferencia
    );


  const corte7Numero =
    fechaReferenciaNumero -
    (
      6 *
      86400000
    );


  const corte14Numero =
    fechaReferenciaNumero -
    (
      13 *
      86400000
    );


  const corte30Numero =
    fechaReferenciaNumero -
    (
      29 *
      86400000
    );


  /*
  ==========================================
  CREAR RANKING
  ==========================================
  */

  const ranking = {};


  animalesOficiales.forEach(
    animal => {

      const clave =
        normalizarAnimal(
          animal.animal
        );


      ranking[clave] = {

        numero:
          animal.numero,

        animal:
          animal.animal,

        salidas: 0,

        salidas30: 0,

        salidas14: 0,

        salidas7: 0,

        ultimaFecha: null

      };

    }
  );


  /*
  ==========================================
  CONTAR HISTORIAL
  ==========================================
  */

  registros.forEach(
    registro => {

      const animal =
        ranking[
          registro.animalClave
        ];


      if (!animal) {

        return;

      }


      animal.salidas++;


      /*
      ----------------------------------------
      ÚLTIMA SALIDA
      ----------------------------------------
      */

      if (
        !animal.ultimaFecha ||
        registro.fecha >
        animal.ultimaFecha
      ) {

        animal.ultimaFecha =
          registro.fecha;

      }


      const numeroFecha =
        fechaNumero(
          registro.fecha
        );


      /*
      ----------------------------------------
      ÚLTIMOS 30 DÍAS
      ----------------------------------------
      */

      if (
        numeroFecha >=
        corte30Numero
      ) {

        animal.salidas30++;

      }


      /*
      ----------------------------------------
      ÚLTIMOS 14 DÍAS
      ----------------------------------------
      */

      if (
        numeroFecha >=
        corte14Numero
      ) {

        animal.salidas14++;

      }


      /*
      ----------------------------------------
      ÚLTIMOS 7 DÍAS
      ----------------------------------------
      */

      if (
        numeroFecha >=
        corte7Numero
      ) {

        animal.salidas7++;

      }

    }
  );


  /*
  ==========================================
  VALORES MÁXIMOS
  ==========================================
  */

  const valores =
    Object.values(
      ranking
    );


  const max7 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas7
      )
    );


  const max14 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas14
      )
    );


  const max30 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas30
      )
    );


  /*
  ==========================================
  CONSTRUIR RESULTADO
  ==========================================
  */

  const resultado =
    valores.map(
      animal => {

        /*
        --------------------------------------
        DÍAS SIN SALIR
        --------------------------------------
        */

        let diasSinSalir = 0;


        if (
          animal.ultimaFecha
        ) {

          diasSinSalir =
            diferenciaDias(
              animal.ultimaFecha,
              fechaReferencia
            );

        }
        else {

          diasSinSalir = 999;

        }


        /*
        --------------------------------------
        PUNTUACIÓN DE ACTIVIDAD
        --------------------------------------
        */

        const puntuacion7 =
          (
            animal.salidas7 /
            max7
          ) * 15;


        const puntuacion14 =
          (
            animal.salidas14 /
            max14
          ) * 10;


        const puntuacion30 =
          (
            animal.salidas30 /
            max30
          ) * 5;


        /*
        --------------------------------------
        PUNTUACIÓN POR ATRASO
        --------------------------------------
        */

        let puntuacionAtraso = 0;


        if (
          diasSinSalir === 999
        ) {

          puntuacionAtraso = 0;

        }

        else if (
          diasSinSalir <= 0
        ) {

          puntuacionAtraso = 0;

        }

        else if (
          diasSinSalir === 1
        ) {

          puntuacionAtraso = 4;

        }

        else if (
          diasSinSalir === 2
        ) {

          puntuacionAtraso = 9;

        }

        else if (
          diasSinSalir === 3
        ) {

          puntuacionAtraso = 15;

        }

        else if (
          diasSinSalir === 4
        ) {

          puntuacionAtraso = 22;

        }

        else if (
          diasSinSalir === 5
        ) {

          puntuacionAtraso = 29;

        }

        else if (
          diasSinSalir === 6
        ) {

          puntuacionAtraso = 36;

        }

        else if (
          diasSinSalir === 7
        ) {

          puntuacionAtraso = 43;

        }

        else if (
          diasSinSalir === 8
        ) {

          puntuacionAtraso = 49;

        }

        else if (
          diasSinSalir === 9
        ) {

          puntuacionAtraso = 55;

        }

        else if (
          diasSinSalir === 10
        ) {

          puntuacionAtraso = 60;

        }

        else {

          puntuacionAtraso =
            Math.min(
              70,
              60 +
              (
                (
                  diasSinSalir -
                  10
                ) * 1.5
              )
            );

        }


        /*
        --------------------------------------
        ÍNDICE BASE
        --------------------------------------
        */

        let indice =
          puntuacionAtraso +
          puntuacion7 +
          puntuacion14 +
          puntuacion30;


        /*
        --------------------------------------
        SALIÓ EN LA FECHA MÁS RECIENTE
        --------------------------------------

        ESTO ES CLAVE.

        SI SALIÓ HOY:

        diasSinSalir = 0

        Y NO PUEDE SER PRONÓSTICO.
        --------------------------------------
        */

        if (
          diasSinSalir === 0
        ) {

          indice = 0;

        }


        /*
        --------------------------------------
        SALIÓ AYER
        --------------------------------------
        */

        else if (
          diasSinSalir === 1
        ) {

          indice =
            Math.max(
              0,
              indice - 22
            );

        }


        /*
        --------------------------------------
        SALIÓ HACE 2 DÍAS
        --------------------------------------
        */

        else if (
          diasSinSalir === 2
        ) {

          indice =
            Math.max(
              0,
              indice - 12
            );

        }


        /*
        --------------------------------------
        EVITAR ANIMALES DEMASIADO ACTIVOS
        --------------------------------------
        */

        if (
          animal.salidas7 >= 3 &&
          diasSinSalir <= 2
        ) {

          indice -= 10;

        }


        if (
          animal.salidas14 >= 7 &&
          diasSinSalir <= 3
        ) {

          indice -= 6;

        }


        /*
        --------------------------------------
        PREMIO POR ATRASO
        --------------------------------------
        */

        if (
          diasSinSalir >= 7 &&
          diasSinSalir < 14
        ) {

          indice += 4;

        }


        if (
          diasSinSalir >= 14
        ) {

          indice += 7;

        }


        /*
        --------------------------------------
        FRECUENCIA HISTÓRICA
        --------------------------------------
        */

        if (
          animal.salidas30 >= 8
        ) {

          indice += 2;

        }


        if (
          animal.salidas30 >= 14
        ) {

          indice += 2;

        }


        /*
        --------------------------------------
        SI SALIÓ HOY, BLOQUEO ABSOLUTO
        --------------------------------------
        */

        if (
          diasSinSalir === 0
        ) {

          indice = 0;

        }


        /*
        --------------------------------------
        LIMITAR ÍNDICE
        --------------------------------------
        */

        indice =
          Math.round(
            Math.max(
              0,
              Math.min(
                100,
                indice
              )
            )
          );


        /*
        --------------------------------------
        TENDENCIA
        --------------------------------------
        */

        let tendencia =
          "BAJA";


        if (
          indice >= 80
        ) {

          tendencia =
            "MUY ALTA";

        }

        else if (
          indice >= 65
        ) {

          tendencia =
            "ALTA";

        }

        else if (
          indice >= 50
        ) {

          tendencia =
            "MEDIA";

        }


        /*
        --------------------------------------
        CATEGORÍA
        --------------------------------------
        */

        let categoria =
          "ATRASADO";


        if (
          diasSinSalir === 0
        ) {

          categoria =
            "SALIO_RECIENTE";

        }

        else if (
          indice >= 80
        ) {

          categoria =
            "CALIENTE";

        }

        else if (
          indice >= 65
        ) {

          categoria =
            "OBSERVACION";

        }


        /*
        --------------------------------------
        RESULTADO
        --------------------------------------
        */

        return {

          numero:
            animal.numero,

          animal:
            animal.animal,

          salidas:
            animal.salidas,

          salidas30:
            animal.salidas30,

          salidas14:
            animal.salidas14,

          salidas7:
            animal.salidas7,

          ultimaFecha:
            animal.ultimaFecha,

          diasSinSalir,

          indice,

          porcentaje:
            indice,

          tendencia,

          categoria,

          pronostico:
            false

        };

      }
    );


  /*
  ==========================================
  ORDENAR
  ==========================================
  */

  resultado.sort(
    (a, b) => {

      /*
      ----------------------------------------
      PRIMERO: LOS QUE NO SALIERON HOY
      ----------------------------------------
      */

      if (
        a.diasSinSalir === 0 &&
        b.diasSinSalir !== 0
      ) {

        return 1;

      }


      if (
        b.diasSinSalir === 0 &&
        a.diasSinSalir !== 0
      ) {

        return -1;

      }


      /*
      ----------------------------------------
      ÍNDICE
      ----------------------------------------
      */

      if (
        b.indice !==
        a.indice
      ) {

        return (
          b.indice -
          a.indice
        );

      }


      /*
      ----------------------------------------
      ATRASO
      ----------------------------------------
      */

      if (
        b.diasSinSalir !==
        a.diasSinSalir
      ) {

        return (
          b.diasSinSalir -
          a.diasSinSalir
        );

      }


      /*
      ----------------------------------------
      ACTIVIDAD 7 DÍAS
      ----------------------------------------
      */

      if (
        b.salidas7 !==
        a.salidas7
      ) {

        return (
          b.salidas7 -
          a.salidas7
        );

      }


      /*
      ----------------------------------------
      ACTIVIDAD 30 DÍAS
      ----------------------------------------
      */

      return (
        b.salidas30 -
        a.salidas30
      );

    }
  );


  /*
  ==========================================
  CANDIDATOS REALES
  ==========================================

  UN ANIMAL QUE SALIÓ HOY NO ENTRA.

  UN ANIMAL QUE SALIÓ AYER TAMPOCO
  ENTRA COMO CANDIDATO PRINCIPAL.

  PRIORIZAMOS ATRASOS DE 2+ DÍAS.
  ==========================================
  */

  const candidatos =
    resultado
      .filter(
        animal =>
          animal.diasSinSalir >= 2 &&
          animal.indice > 0
      )
      .slice(
        0,
        12
      );


  /*
  ==========================================
  MARCAR LOS 3 PRIMEROS CANDIDATOS
  ==========================================
  */

  candidatos
    .slice(0, 3)
    .forEach(
      animal => {

        animal.pronostico =
          true;

        animal.categoria =
          "PRONÓSTICO";

      }
    );


  /*
  ==========================================
  DIAGNÓSTICO INTERNO
  ==========================================
  */

  console.log(
    "XTREME ANALISIS:",
    {

      fechaReferencia,

      totalRegistros:
        registros.length,

      candidatos:
        candidatos
          .slice(0, 12)
          .map(
            animal => ({
              numero:
                animal.numero,

              animal:
                animal.animal,

              ultimaFecha:
                animal.ultimaFecha,

              diasSinSalir:
                animal.diasSinSalir,

              salidas7:
                animal.salidas7,

              salidas14:
                animal.salidas14,

              salidas30:
                animal.salidas30,

              indice:
                animal.indice
            })
          )

    }
  );


  /*
  ==========================================
  DEVOLVER LOS 77
  ==========================================
  */

  return resultado.slice(
    0,
    77
  );

}
