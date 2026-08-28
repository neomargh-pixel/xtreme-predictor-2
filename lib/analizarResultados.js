/*
==========================================
XTREME PREDICTOR
ANALIZADOR DIARIO DE LOS 77 ANIMALITOS
==========================================

REGLA DEL PRONÓSTICO:

ANTES DE LAS 10:00 PM:
- Pronóstico para HOY.
- Se calcula usando el historial cerrado
  hasta el día anterior.

DESDE LAS 10:00 PM:
- Pronóstico para MAÑANA.
- Se calcula usando también todos los
  resultados del día actual.

Así el nuevo pronóstico aparece desde
las 10:00 PM y permanece durante la
madrugada y el día siguiente.
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

    return animalesOficiales.map(
      a => ({

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

      })
    );

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
  HOY EN CARACAS
  ==========================================
  */

  function obtenerHoyCaracas() {

    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "America/Caracas",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(
      new Date()
    );

  }


  /*
  ==========================================
  HORA ACTUAL DE CARACAS
  ==========================================
  */

  function obtenerHoraCaracas() {

    const partes =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "America/Caracas",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }
      ).formatToParts(
        new Date()
      );


    const parteHora =
      partes.find(
        parte =>
          parte.type === "hour"
      );


    const hora =
      parteHora
        ? parseInt(
            parteHora.value,
            10
          )
        : 0;


    return Number.isFinite(
      hora
    )

      ?

      hora

      :

      0;

  }


  /*
  ==========================================
  SUMAR UN DÍA
  ==========================================
  */

  function sumarUnDia(fecha) {

    const numero =
      fechaNumero(
        fecha
      );


    if (
      !Number.isFinite(
        numero
      )
    ) {

      return fecha;

    }


    const siguiente =
      new Date(
        numero +
        86400000
      );


    const año =
      siguiente.getUTCFullYear();


    const mes =
      String(
        siguiente.getUTCMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const dia =
      String(
        siguiente.getUTCDate()
      ).padStart(
        2,
        "0"
      );


    return (
      `${año}-${mes}-${dia}`
    );

  }


  /*
  ==========================================
  FECHA A NÚMERO
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
      .map(
        registro => {

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

        }
      )
      .filter(Boolean);


  if (
    registros.length === 0
  ) {

    return resultadoSinDatos();

  }


  /*
  ==========================================
  FECHA MÁS RECIENTE DEL HISTORIAL
  ==========================================
  */

  const fechas =
    registros
      .map(
        r =>
          r.fecha
      )
      .filter(Boolean)
      .sort();


  const fechaMasReciente =
    fechas[
      fechas.length - 1
    ];


  /*
  ==========================================
  REGLA 10:00 PM VENEZUELA
  ==========================================

  ANTES DE LAS 10 PM:

    objetivo = HOY
    base = HISTORIAL ANTERIOR A HOY

  DESDE LAS 10 PM:

    objetivo = MAÑANA
    base = HISTORIAL ANTERIOR A MAÑANA

  Esto hace que a las 10 PM se genere
  automáticamente el pronóstico siguiente.
  ==========================================
  */

  const hoyCaracas =
    obtenerHoyCaracas();


  const horaCaracas =
    obtenerHoraCaracas();


  const despuesDeLas10PM =
    horaCaracas >= 22;


  const fechaPronostico =
    despuesDeLas10PM

      ?

      sumarUnDia(
        hoyCaracas
      )

      :

      hoyCaracas;


  /*
  ==========================================
  HISTORIAL PARA CALCULAR EL PRONÓSTICO
  ==========================================
  */

  const registrosParaPronostico =
    registros.filter(
      registro =>
        registro.fecha <
        fechaPronostico
    );


  /*
  ==========================================
  SI TODAVÍA NO HAY HISTORIAL ANTERIOR
  ==========================================
  */

  const registrosFinalesPronostico =
    registrosParaPronostico.length > 0

      ?

      registrosParaPronostico

      :

      registros;


  /*
  ==========================================
  FECHA DE REFERENCIA DEL PRONÓSTICO
  ==========================================
  */

  const fechasPronostico =
    registrosFinalesPronostico
      .map(
        r =>
          r.fecha
      )
      .filter(Boolean)
      .sort();


  const fechaReferenciaPronostico =
    fechasPronostico[
      fechasPronostico.length - 1
    ];


  /*
  ==========================================
  CORTES
  ==========================================
  */

  const fechaReferenciaPronosticoNumero =
    fechaNumero(
      fechaReferenciaPronostico
    );


  const corte7Numero =
    fechaReferenciaPronosticoNumero -
    (
      6 *
      86400000
    );


  const corte14Numero =
    fechaReferenciaPronosticoNumero -
    (
      13 *
      86400000
    );


  const corte30Numero =
    fechaReferenciaPronosticoNumero -
    (
      29 *
      86400000
    );


  /*
  ==========================================
  RANKING DEL PRONÓSTICO
  ==========================================
  */

  const rankingPronostico =
    {};


  animalesOficiales.forEach(
    animal => {

      const clave =
        normalizarAnimal(
          animal.animal
        );


      rankingPronostico[
        clave
      ] = {

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
  CONTAR HISTORIAL DEL PRONÓSTICO
  ==========================================
  */

  registrosFinalesPronostico.forEach(
    registro => {

      const animal =
        rankingPronostico[
          registro.animalClave
        ];


      if (!animal) {
        return;
      }


      animal.salidas++;


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


      if (
        numeroFecha >=
        corte30Numero
      ) {

        animal.salidas30++;

      }


      if (
        numeroFecha >=
        corte14Numero
      ) {

        animal.salidas14++;

      }


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
  MÁXIMOS
  ==========================================
  */

  const valoresPronostico =
    Object.values(
      rankingPronostico
    );


  const max7 =
    Math.max(
      1,
      ...valoresPronostico.map(
        a =>
          a.salidas7
      )
    );


  const max14 =
    Math.max(
      1,
      ...valoresPronostico.map(
        a =>
          a.salidas14
      )
    );


  const max30 =
    Math.max(
      1,
      ...valoresPronostico.map(
        a =>
          a.salidas30
      )
    );


  /*
  ==========================================
  CALCULAR CANDIDATOS
  ==========================================
  */

  const candidatosPronostico =
    valoresPronostico.map(
      animal => {

        let diasSinSalir;


        if (
          animal.ultimaFecha
        ) {

          diasSinSalir =
            diferenciaDias(
              animal.ultimaFecha,
              fechaReferenciaPronostico
            );

        }

        else {

          diasSinSalir =
            999;

        }


        /*
        ACTIVIDAD
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
        ATRASO
        */

        let puntuacionAtraso =
          0;


        if (
          diasSinSalir >= 2 &&
          diasSinSalir <= 10
        ) {

          puntuacionAtraso =
            9 +
            (
              (
                diasSinSalir -
                2
              ) *
              7
            );

        }

        else if (
          diasSinSalir > 10
        ) {

          puntuacionAtraso =
            Math.min(
              70,
              65 +
              (
                (
                  diasSinSalir -
                  10
                ) *
                1.2
              )
            );

        }


        /*
        ÍNDICE
        */

        let indice =
          puntuacionAtraso +
          puntuacion7 +
          puntuacion14 +
          puntuacion30;


        /*
        CASTIGO POR SALIDA RECIENTE
        */

        if (
          diasSinSalir === 1
        ) {

          indice -= 20;

        }


        if (
          diasSinSalir === 2
        ) {

          indice -= 8;

        }


        /*
        ANIMALES MUY ACTIVOS
        */

        if (
          animal.salidas7 >= 3 &&
          diasSinSalir <= 3
        ) {

          indice -= 10;

        }


        if (
          animal.salidas14 >= 7 &&
          diasSinSalir <= 4
        ) {

          indice -= 6;

        }


        /*
        BLOQUEO DE SALIDA MÁS RECIENTE
        */

        if (
          diasSinSalir === 0
        ) {

          indice = 0;

        }


        /*
        LIMITAR A 0-100
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
        TENDENCIA
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
        CATEGORÍA
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

  candidatosPronostico.sort(
    (a, b) => {

      if (
        b.indice !==
        a.indice
      ) {

        return (
          b.indice -
          a.indice
        );

      }


      if (
        b.diasSinSalir !==
        a.diasSinSalir
      ) {

        return (
          b.diasSinSalir -
          a.diasSinSalir
        );

      }


      if (
        b.salidas7 !==
        a.salidas7
      ) {

        return (
          b.salidas7 -
          a.salidas7
        );

      }


      if (
        b.salidas14 !==
        a.salidas14
      ) {

        return (
          b.salidas14 -
          a.salidas14
        );

      }


      return (
        b.salidas30 -
        a.salidas30
      );

    }
  );


  /*
  ==========================================
  FILTRO DE CANDIDATOS
  ==========================================
  */

  const candidatos =
    candidatosPronostico
      .filter(
        animal =>
          animal.diasSinSalir >= 2 &&
          animal.indice > 0
      )
      .slice(
        0,
        15
      );


  /*
  ==========================================
  SEMILLA
  ==========================================
  */

  function crearSemilla(texto) {

    let hash = 0;


    for (
      let i = 0;
      i < texto.length;
      i++
    ) {

      hash =
        (
          (
            hash << 5
          ) -
          hash
        ) +
        texto.charCodeAt(i);


      hash |= 0;

    }


    return Math.abs(
      hash
    );

  }


  /*
  ==========================================
  PRONÓSTICOS
  ==========================================
  */

  let pronosticos =
    [];


  if (
    candidatos.length > 0
  ) {

    /*
      MUY IMPORTANTE:

      La semilla usa la FECHA DEL DÍA
      PARA EL CUAL SE ESTÁ GENERANDO
      EL PRONÓSTICO.

      Eso evita que a las 10 PM se
      conserve accidentalmente la
      semilla del día actual.
    */

    const semilla =
      crearSemilla(
        fechaPronostico
      );


    const cantidad =
      candidatos.length;


    const inicio =
      semilla %
      cantidad;


    const usados =
      new Set();


    for (
      let i = 0;
      i < cantidad &&
      pronosticos.length < 3;
      i++
    ) {

      const indice =
        (
          inicio +
          i
        ) %
        cantidad;


      const candidato =
        candidatos[
          indice
        ];


      if (!candidato) {
        continue;
      }


      const nombre =
        normalizarAnimal(
          candidato.animal
        );


      if (
        usados.has(
          nombre
        )
      ) {

        continue;

      }


      usados.add(
        nombre
      );


      pronosticos.push(
        candidato
      );

    }

  }


  /*
  ==========================================
  MARCAR PRONÓSTICOS
  ==========================================
  */

  const nombresPronosticos =
    new Set(
      pronosticos.map(
        animal =>
          normalizarAnimal(
            animal.animal
          )
      )
    );


  /*
  ==========================================
  RESULTADO GENERAL
  ==========================================
  */

  const fechaReferenciaGeneral =
    fechaMasReciente;


  const fechaReferenciaGeneralNumero =
    fechaNumero(
      fechaReferenciaGeneral
    );


  const corteGeneral7 =
    fechaReferenciaGeneralNumero -
    (
      6 *
      86400000
    );


  const corteGeneral14 =
    fechaReferenciaGeneralNumero -
    (
      13 *
      86400000
    );


  const corteGeneral30 =
    fechaReferenciaGeneralNumero -
    (
      29 *
      86400000
    );


  const ranking =
    {};


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
  CONTAR HISTORIAL GENERAL
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


      if (
        numeroFecha >=
        corteGeneral30
      ) {

        animal.salidas30++;

      }


      if (
        numeroFecha >=
        corteGeneral14
      ) {

        animal.salidas14++;

      }


      if (
        numeroFecha >=
        corteGeneral7
      ) {

        animal.salidas7++;

      }

    }
  );


  const valores =
    Object.values(
      ranking
    );


  const maxGeneral7 =
    Math.max(
      1,
      ...valores.map(
        a =>
          a.salidas7
      )
    );


  const maxGeneral14 =
    Math.max(
      1,
      ...valores.map(
        a =>
          a.salidas14
      )
    );


  const maxGeneral30 =
    Math.max(
      1,
      ...valores.map(
        a =>
          a.salidas30
      )
    );


  /*
  ==========================================
  CREAR RESULTADO GENERAL
  ==========================================
  */

  const resultado =
    valores.map(
      animal => {

        let diasSinSalir;


        if (
          animal.ultimaFecha
        ) {

          diasSinSalir =
            diferenciaDias(
              animal.ultimaFecha,
              fechaReferenciaGeneral
            );

        }

        else {

          diasSinSalir =
            999;

        }


        const puntuacion7 =
          (
            animal.salidas7 /
            maxGeneral7
          ) * 15;


        const puntuacion14 =
          (
            animal.salidas14 /
            maxGeneral14
          ) * 10;


        const puntuacion30 =
          (
            animal.salidas30 /
            maxGeneral30
          ) * 5;


        let puntuacionAtraso =
          0;


        if (
          diasSinSalir >= 2 &&
          diasSinSalir <= 10
        ) {

          puntuacionAtraso =
            9 +
            (
              (
                diasSinSalir -
                2
              ) *
              7
            );

        }

        else if (
          diasSinSalir > 10
        ) {

          puntuacionAtraso =
            Math.min(
              70,
              65 +
              (
                (
                  diasSinSalir -
                  10
                ) *
                1.2
              )
            );

        }


        let indice =
          puntuacionAtraso +
          puntuacion7 +
          puntuacion14 +
          puntuacion30;


        if (
          diasSinSalir === 1
        ) {

          indice -= 20;

        }


        if (
          diasSinSalir === 2
        ) {

          indice -= 8;

        }


        if (
          animal.salidas7 >= 3 &&
          diasSinSalir <= 3
        ) {

          indice -= 10;

        }


        if (
          animal.salidas14 >= 7 &&
          diasSinSalir <= 4
        ) {

          indice -= 6;

        }


        if (
          diasSinSalir === 0
        ) {

          indice = 0;

        }


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


        const nombre =
          normalizarAnimal(
            animal.animal
          );


        /*
        --------------------------------------
        EL PRONÓSTICO DEL DÍA SIGUE SIENDO
        EL PRONÓSTICO CALCULADO PARA LA FECHA
        CORRESPONDIENTE.
        --------------------------------------
        */

        const esPronostico =
          nombresPronosticos.has(
            nombre
          );


        const datosPronostico =
          pronosticos.find(
            pronostico =>
              normalizarAnimal(
                pronostico.animal
              ) ===
              nombre
          );


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
            esPronostico &&
            datosPronostico

              ?

              datosPronostico.porcentaje

              :

              indice,

          tendencia:
            esPronostico &&
            datosPronostico

              ?

              datosPronostico.tendencia

              :

              tendencia,

          categoria:
            esPronostico

              ?

              "PRONÓSTICO"

              :

              categoria,

          pronostico:
            esPronostico

        };

      }
    );


  /*
  ==========================================
  ORDEN FINAL
  ==========================================
  */

  resultado.sort(
    (a, b) => {

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


      if (
        b.indice !==
        a.indice
      ) {

        return (
          b.indice -
          a.indice
        );

      }


      if (
        b.diasSinSalir !==
        a.diasSinSalir
      ) {

        return (
          b.diasSinSalir -
          a.diasSinSalir
        );

      }


      return (
        b.salidas30 -
        a.salidas30
      );

    }
  );


  /*
  ==========================================
  DIAGNÓSTICO
  ==========================================
  */

  console.log(
    "XTREME PRONOSTICO:",
    {

      ahoraCaracas:
        `${horaCaracas}:00`,

      despuesDeLas10PM,

      fechaActual:
        hoyCaracas,

      fechaPronostico,

      fechaReferenciaPronostico,

      candidatos:
        candidatos.map(
          animal => ({
            animal:
              animal.animal,

            indice:
              animal.indice,

            diasSinSalir:
              animal.diasSinSalir,

            salidas7:
              animal.salidas7,

            salidas14:
              animal.salidas14,

            salidas30:
              animal.salidas30

          })
        ),

      pronosticos:
        pronosticos.map(
          animal =>
            animal.animal
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
