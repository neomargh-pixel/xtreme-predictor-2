/*
==========================================
XTREME PREDICTOR
ANALIZADOR ESTADÍSTICO AVANZADO
DE LOS 77 ANIMALITOS
==========================================

MODELO XTREME:

1. FRECUENCIA HISTÓRICA
2. FRECUENCIA 30 DÍAS
3. FRECUENCIA 14 DÍAS
4. FRECUENCIA 7 DÍAS
5. ATRASO
6. EMPAREJAMIENTOS
7. TRANSICIONES
8. REGULARIDAD
9. TENDENCIA

REGLA DEL PRONÓSTICO:

ANTES DE LAS 10:00 PM:
- Pronóstico para HOY.
- Se calcula usando historial cerrado
  hasta el día anterior.

DESDE LAS 10:00 PM:
- Pronóstico para MAÑANA.
- Se calcula usando también todos los
  resultados del día actual.
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
      ? hora
      : 0;

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
  SUMAR UN DÍA
  ==========================================
  */

  function sumarUnDia(fecha) {

    const numero =
      fechaNumero(fecha);


    if (
      !Number.isFinite(numero)
    ) {

      return fecha;

    }


    const siguiente =
      new Date(
        numero + 86400000
      );


    return (
      `${siguiente.getUTCFullYear()}-` +
      `${String(
        siguiente.getUTCMonth() + 1
      ).padStart(2, "0")}-` +
      `${String(
        siguiente.getUTCDate()
      ).padStart(2, "0")}`
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

  IMPORTANTE:
  Conservamos ORDEN del registro.

  Esto permite estudiar:
  - qué sale después de qué
  - secuencias
  - transiciones
  ==========================================
  */

  const registros =
    historial
      .map(
        (registro, indice) => {

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

            fecha,

            orden:
              String(
                registro.fecha ?? ""
              ),

            indiceOriginal:
              indice

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
  ORDEN CRONOLÓGICO
  ==========================================
  */

  registros.sort(
    (a, b) => {

      if (
        a.orden <
        b.orden
      ) {

        return -1;

      }


      if (
        a.orden >
        b.orden
      ) {

        return 1;

      }


      return (
        a.indiceOriginal -
        b.indiceOriginal
      );

    }
  );


  /*
  ==========================================
  FECHAS DISPONIBLES
  ==========================================
  */

  const fechas =
    registros
      .map(
        r => r.fecha
      )
      .filter(Boolean)
      .sort();


  const fechaMasReciente =
    fechas[
      fechas.length - 1
    ];


  /*
  ==========================================
  REGLA 10 PM
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
      ? sumarUnDia(
          hoyCaracas
        )
      : hoyCaracas;


  /*
  ==========================================
  HISTORIAL BASE DEL PRONÓSTICO
  ==========================================
  */

  const registrosParaPronostico =
    registros.filter(
      registro =>
        registro.fecha <
        fechaPronostico
    );


  const registrosFinalesPronostico =
    registrosParaPronostico.length > 0
      ? registrosParaPronostico
      : registros;


  /*
  ==========================================
  FECHA DE REFERENCIA
  ==========================================
  */

  const fechasPronostico =
    registrosFinalesPronostico
      .map(
        r => r.fecha
      )
      .filter(Boolean)
      .sort();


  const fechaReferenciaPronostico =
    fechasPronostico[
      fechasPronostico.length - 1
    ];


  const referenciaNumero =
    fechaNumero(
      fechaReferenciaPronostico
    );


  /*
  ==========================================
  CORTES
  ==========================================
  */

  const corte7Numero =
    referenciaNumero -
    (
      6 *
      86400000
    );


  const corte14Numero =
    referenciaNumero -
    (
      13 *
      86400000
    );


  const corte30Numero =
    referenciaNumero -
    (
      29 *
      86400000
    );


  /*
  ==========================================
  CREAR RANKING
  ==========================================
  */

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

        ultimaFecha: null,

        fechas: [],

        indice: 0

      };

    }
  );


  /*
  ==========================================
  CONTAR FRECUENCIAS
  ==========================================
  */

  registrosFinalesPronostico.forEach(
    registro => {

      const animal =
        ranking[
          registro.animalClave
        ];


      if (!animal) {
        return;
      }


      animal.salidas++;


      animal.fechas.push(
        registro.fecha
      );


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


  const valores =
    Object.values(
      ranking
    );


  /*
  ==========================================
  MÁXIMOS
  ==========================================
  */

  const maxHistorico =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas
      )
    );


  const max30 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas30
      )
    );


  const max14 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas14
      )
    );


  const max7 =
    Math.max(
      1,
      ...valores.map(
        a => a.salidas7
      )
    );


  /*
  ==========================================
  ÚLTIMOS RESULTADOS
  ==========================================
  */

  const ultimosRegistros =
    registrosFinalesPronostico.slice(
      -100
    );


  /*
  ==========================================
  ÚLTIMO RESULTADO
  ==========================================
  */

  const ultimoRegistro =
    registrosFinalesPronostico[
      registrosFinalesPronostico.length - 1
    ];


  const ultimoAnimal =
    ultimoRegistro
      ? ultimoRegistro.animalClave
      : null;


  /*
  ==========================================
  EMPAREJAMIENTOS POR JORNADA
  ==========================================

  Aquí no contamos simplemente quién salió
  más veces.

  Medimos qué animales tienden a aparecer
  dentro de la misma fecha.

  Ejemplo:

  Si TIGRE y PAVO aparecen juntos
  muchas veces históricamente,
  TIGRE aumenta el emparejamiento
  de PAVO y viceversa.
  ==========================================
  */

  const jornadas =
    new Map();


  registrosFinalesPronostico.forEach(
    registro => {

      if (
        !jornadas.has(
          registro.fecha
        )
      ) {

        jornadas.set(
          registro.fecha,
          []
        );

      }


      jornadas
        .get(
          registro.fecha
        )
        .push(
          registro.animalClave
        );

    }
  );


  /*
  ==========================================
  TABLA DE EMPAREJAMIENTOS
  ==========================================
  */

  const emparejamientos =
    {};


  animalesOficiales.forEach(
    animal => {

      const clave =
        normalizarAnimal(
          animal.animal
        );


      emparejamientos[
        clave
      ] = {};

    }
  );


  jornadas.forEach(
    lista => {

      const unicos =
        [
          ...new Set(
            lista
          )
        ];


      for (
        let i = 0;
        i < unicos.length;
        i++
      ) {

        for (
          let j = i + 1;
        j < unicos.length;
        j++
        ) {

          const a =
            unicos[i];


          const b =
            unicos[j];


          if (
            !emparejamientos[a]
          ) {

            emparejamientos[a] =
              {};

          }


          if (
            !emparejamientos[b]
          ) {

            emparejamientos[b] =
              {};

          }


          emparejamientos[a][b] =
            (
              emparejamientos[a][b] ||
              0
            ) + 1;


          emparejamientos[b][a] =
            (
              emparejamientos[b][a] ||
              0
            ) + 1;

        }

      }

    }
  );


  /*
  ==========================================
  TRANSICIONES
  ==========================================

  Estudia:

  A → B

  cuántas veces B aparece después
  de A en el historial cronológico.
  ==========================================
  */

  const transiciones =
    {};


  animalesOficiales.forEach(
    animal => {

      const clave =
        normalizarAnimal(
          animal.animal
        );


      transiciones[
        clave
      ] = {};

    }
  );


  for (
    let i = 1;
    i <
    registrosFinalesPronostico.length;
    i++
  ) {

    const anterior =
      registrosFinalesPronostico[
        i - 1
      ];


    const actual =
      registrosFinalesPronostico[
        i
      ];


    if (
      !anterior ||
      !actual
    ) {

      continue;

    }


    const desde =
      anterior.animalClave;


    const hacia =
      actual.animalClave;


    if (
      !transiciones[desde]
    ) {

      transiciones[desde] =
        {};

    }


    transiciones[desde][hacia] =
      (
        transiciones[desde][hacia] ||
        0
      ) + 1;

  }


  /*
  ==========================================
  TRANSICIONES RECIENTES
  ==========================================
  */

  const transicionesRecientes =
    {};


  animalesOficiales.forEach(
    animal => {

      const clave =
        normalizarAnimal(
          animal.animal
        );


      transicionesRecientes[
        clave
      ] = {};

    }
  );


  const inicioReciente =
    Math.max(
      1,
      registrosFinalesPronostico.length -
      250
    );


  for (
    let i = inicioReciente;
    i <
    registrosFinalesPronostico.length;
    i++
  ) {

    const anterior =
      registrosFinalesPronostico[
        i - 1
      ];


    const actual =
      registrosFinalesPronostico[
        i
      ];


    if (
      !anterior ||
      !actual
    ) {

      continue;

    }


    const desde =
      anterior.animalClave;


    const hacia =
      actual.animalClave;


    if (
      !transicionesRecientes[desde]
    ) {

      transicionesRecientes[desde] =
        {};

    }


    transicionesRecientes[desde][hacia] =
      (
        transicionesRecientes[desde][hacia] ||
        0
      ) + 1;

  }


  /*
  ==========================================
  MÁXIMO EMPAREJAMIENTO
  ==========================================
  */

  let maxEmparejamiento =
    1;


  Object.values(
    emparejamientos
  ).forEach(
    mapa => {

      Object.values(
        mapa
      ).forEach(
        cantidad => {

          if (
            cantidad >
            maxEmparejamiento
          ) {

            maxEmparejamiento =
              cantidad;

          }

        }
      );

    }
  );


  /*
  ==========================================
  MÁXIMA TRANSICIÓN
  ==========================================
  */

  let maxTransicion =
    1;


  Object.values(
    transiciones
  ).forEach(
    mapa => {

      Object.values(
        mapa
      ).forEach(
        cantidad => {

          if (
            cantidad >
            maxTransicion
          ) {

            maxTransicion =
              cantidad;

          }

        }
      );

    }
  );


  /*
  ==========================================
  REGULARIDAD
  ==========================================

  Medimos qué tan estable es el intervalo
  entre las salidas de cada animal.

  Menor variación =
  mayor regularidad.
  ==========================================
  */

  function calcularRegularidad(
    fechasAnimal
  ) {

    if (
      !Array.isArray(
        fechasAnimal
      ) ||
      fechasAnimal.length < 3
    ) {

      return 0;

    }


    const ordenadas =
      [
        ...new Set(
          fechasAnimal
        )
      ].sort();


    if (
      ordenadas.length < 3
    ) {

      return 0;

    }


    const intervalos =
      [];


    for (
      let i = 1;
      i < ordenadas.length;
      i++
    ) {

      const diferencia =
        diferenciaDias(
          ordenadas[i - 1],
          ordenadas[i]
        );


      if (
        diferencia > 0
      ) {

        intervalos.push(
          diferencia
        );

      }

    }


    if (
      intervalos.length < 2
    ) {

      return 0;

    }


    const promedio =
      intervalos.reduce(
        (suma, valor) =>
          suma + valor,
        0
      ) /
      intervalos.length;


    if (
      promedio <= 0
    ) {

      return 0;

    }


    const desviacion =
      Math.sqrt(
        intervalos.reduce(
          (
            suma,
            valor
          ) =>
            suma +
            Math.pow(
              valor -
              promedio,
              2
            ),
          0
        ) /
        intervalos.length
      );


    const coeficiente =
      desviacion /
      promedio;


    return Math.max(
      0,
      Math.min(
        1,
        1 -
        coeficiente
      )
    );

  }


  /*
  ==========================================
  CALCULAR PUNTAJE DE EMPAREJAMIENTO
  ==========================================
  */

  function calcularPuntajeEmparejamiento(
    clave
  ) {

    const mapa =
      emparejamientos[
        clave
      ] || {};


    const cantidades =
      Object.values(
        mapa
      );


    if (
      cantidades.length === 0
    ) {

      return 0;

    }


    /*
    Tomamos los mejores emparejamientos
    para evitar que una gran cantidad de
    relaciones débiles domine el resultado.
    */

    cantidades.sort(
      (a, b) =>
        b - a
    );


    const mejores =
      cantidades.slice(
        0,
        5
      );


    const promedio =
      mejores.reduce(
        (suma, valor) =>
          suma + valor,
        0
      ) /
      mejores.length;


    return Math.min(
      1,
      promedio /
      Math.max(
        1,
        maxEmparejamiento
      )
    );

  }


  /*
  ==========================================
  CALCULAR TRANSICIÓN
  ==========================================
  */

  function calcularPuntajeTransicion(
    clave
  ) {

    if (
      !ultimoAnimal
    ) {

      return 0;

    }


    const mapa =
      transiciones[
        ultimoAnimal
      ] || {};


    const total =
      Object.values(
        mapa
      ).reduce(
        (
          suma,
          valor
        ) =>
          suma + valor,
        0
      );


    if (
      total <= 0
    ) {

      return 0;

    }


    const cantidad =
      mapa[
        clave
      ] || 0;


    /*
    Probabilidad histórica de que el
    candidato aparezca después del último.
    */

    const probabilidad =
      cantidad /
      total;


    /*
    También usamos la actividad reciente
    de esa transición.
    */

    const mapaReciente =
      transicionesRecientes[
        ultimoAnimal
      ] || {};


    const totalReciente =
      Object.values(
        mapaReciente
      ).reduce(
        (
          suma,
          valor
        ) =>
          suma + valor,
        0
      );


    const cantidadReciente =
      mapaReciente[
        clave
      ] || 0;


    const reciente =
      totalReciente > 0
        ? cantidadReciente /
          totalReciente
        : 0;


    return Math.min(
      1,
      (
        probabilidad *
        0.6
      ) +
      (
        reciente *
        0.4
      )
    );

  }


  /*
  ==========================================
  EMPAREJAMIENTO CON LA ÚLTIMA JORNADA
  ==========================================
  */

  const animalesUltimaJornada =
    jornadas.get(
      fechaReferenciaPronostico
    ) || [];


  const ultimosUnicos =
    [
      ...new Set(
        animalesUltimaJornada
      )
    ];


  function calcularEmparejamientoReciente(
    clave
  ) {

    if (
      ultimosUnicos.length === 0
    ) {

      return 0;

    }


    let suma =
      0;


    let encontrados =
      0;


    ultimosUnicos.forEach(
      otro => {

        if (
          otro === clave
        ) {

          return;

        }


        const cantidad =
          (
            emparejamientos[
              clave
            ] || {}
          )[
            otro
          ] || 0;


        if (
          cantidad > 0
        ) {

          suma +=
            Math.min(
              1,
              cantidad /
              Math.max(
                1,
                maxEmparejamiento
              )
            );


          encontrados++;

        }

      }
    );


    if (
      encontrados === 0
    ) {

      return 0;

    }


    return Math.min(
      1,
      suma /
      encontrados
    );

  }


  /*
  ==========================================
  MÁXIMO ATRASO
  ==========================================
  */

  function calcularPuntajeAtraso(
    diasSinSalir
  ) {

    if (
      !Number.isFinite(
        diasSinSalir
      ) ||
      diasSinSalir <= 0
    ) {

      return 0;

    }


    /*
    El atraso ayuda,
    pero NO domina el modelo.
    */

    if (
      diasSinSalir === 1
    ) {

      return 0;

    }


    if (
      diasSinSalir <= 3
    ) {

      return (
        0.25 +
        (
          diasSinSalir -
          2
        ) *
        0.10
      );

    }


    if (
      diasSinSalir <= 7
    ) {

      return (
        0.35 +
        (
          diasSinSalir -
          3
        ) *
        0.08
      );

    }


    if (
      diasSinSalir <= 14
    ) {

      return (
        0.67 +
        (
          diasSinSalir -
          7
        ) *
        0.035
      );

    }


    return Math.min(
      1,
      0.92 +
      (
        diasSinSalir -
        14
      ) *
      0.005
    );

  }


  /*
  ==========================================
  CALCULAR CANDIDATOS
  ==========================================
  */

  const candidatosPronostico =
    valores.map(
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
        ======================================
        COMPONENTES DEL MODELO
        ======================================
        */

        const frecuenciaHistorica =
          Math.min(
            1,
            animal.salidas /
            maxHistorico
          );


        const frecuencia30 =
          Math.min(
            1,
            animal.salidas30 /
            max30
          );


        const frecuencia14 =
          Math.min(
            1,
            animal.salidas14 /
            max14
          );


        const frecuencia7 =
          Math.min(
            1,
            animal.salidas7 /
            max7
          );


        const atraso =
          calcularPuntajeAtraso(
            diasSinSalir
          );


        const emparejamiento =
          calcularPuntajeEmparejamiento(
            normalizarAnimal(
              animal.animal
            )
          );


        const emparejamientoReciente =
          calcularEmparejamientoReciente(
            normalizarAnimal(
              animal.animal
            )
          );


        const transicion =
          calcularPuntajeTransicion(
            normalizarAnimal(
              animal.animal
            )
          );


        const regularidad =
          calcularRegularidad(
            animal.fechas
          );


        /*
        ======================================
        TENDENCIA
        ======================================

        Compara actividad reciente contra
        actividad histórica del mismo animal.
        */

        let tendenciaReciente =
          0;


        if (
          animal.salidas30 > 0
        ) {

          const esperado14 =
            (
              animal.salidas30 /
              30
            ) *
            14;


          if (
            esperado14 > 0
          ) {

            tendenciaReciente =
              Math.min(
                1,
                animal.salidas14 /
                (
                  esperado14 *
                  1.8
                )
              );

          }

        }


        /*
        ======================================
        SCORE XTREME
        ======================================

        PESOS:

        Histórico       10
        30 días         10
        14 días         12
        7 días          13
        Atraso          12
        Emparejamiento  12
        Transición      10
        Regularidad      8
        Tendencia       13

        TOTAL           100
        ======================================
        */

        let puntuacionHistorica =
          frecuenciaHistorica *
          10;


        let puntuacion30 =
          frecuencia30 *
          10;


        let puntuacion14 =
          frecuencia14 *
          12;


        let puntuacion7 =
          frecuencia7 *
          13;


        let puntuacionAtraso =
          atraso *
          12;


        let puntuacionEmparejamiento =
          (
            emparejamiento *
            0.6 +
            emparejamientoReciente *
            0.4
          ) *
          12;


        let puntuacionTransicion =
          transicion *
          10;


        let puntuacionRegularidad =
          regularidad *
          8;


        let puntuacionTendencia =
          tendenciaReciente *
          13;


        /*
        ======================================
        ÍNDICE BASE
        ======================================
        */

        let indice =
          puntuacionHistorica +
          puntuacion30 +
          puntuacion14 +
          puntuacion7 +
          puntuacionAtraso +
          puntuacionEmparejamiento +
          puntuacionTransicion +
          puntuacionRegularidad +
          puntuacionTendencia;


        /*
        ======================================
        CASTIGO POR SALIDA RECIENTE
        ======================================
        */

        if (
          diasSinSalir === 0
        ) {

          indice = 0;

        }


        if (
          diasSinSalir === 1
        ) {

          indice *=
            0.45;

        }


        /*
        ======================================
        EVITAR SOBREVALORAR ANIMALES
        DEMASIADO ACTIVOS
        ======================================
        */

        if (
          animal.salidas7 >= 4 &&
          diasSinSalir <= 2
        ) {

          indice *=
            0.82;

        }


        if (
          animal.salidas14 >= 8 &&
          diasSinSalir <= 3
        ) {

          indice *=
            0.90;

        }


        /*
        ======================================
        BONIFICACIÓN POR CONFLUENCIA
        ======================================

        Cuando varios factores apuntan al
        mismo animal simultáneamente.
        */

        let factoresFuertes =
          0;


        if (
          frecuencia7 >= 0.70
        ) {

          factoresFuertes++;

        }


        if (
          frecuencia14 >= 0.70
        ) {

          factoresFuertes++;

        }


        if (
          frecuencia30 >= 0.70
        ) {

          factoresFuertes++;

        }


        if (
          emparejamiento >= 0.60
        ) {

          factoresFuertes++;

        }


        if (
          transicion >= 0.20
        ) {

          factoresFuertes++;

        }


        if (
          regularidad >= 0.60
        ) {

          factoresFuertes++;

        }


        if (
          tendenciaReciente >= 0.70
        ) {

          factoresFuertes++;

        }


        if (
          factoresFuertes >= 4 &&
          diasSinSalir >= 2
        ) {

          indice += 4;

        }


        if (
          factoresFuertes >= 6 &&
          diasSinSalir >= 2
        ) {

          indice += 4;

        }


        /*
        ======================================
        LIMITAR 0-100
        ======================================
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
        ======================================
        TENDENCIA
        ======================================
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
        ======================================
        CATEGORÍA
        ======================================
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

        else if (
          indice >= 50
        ) {

          categoria =
            "TENDENCIA";

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
            false,

          /*
          DATOS INTERNOS DEL MODELO
          */

          frecuenciaHistorica:
            Math.round(
              frecuenciaHistorica *
              100
            ),

          frecuencia30:
            Math.round(
              frecuencia30 *
              100
            ),

          frecuencia14:
            Math.round(
              frecuencia14 *
              100
            ),

          frecuencia7:
            Math.round(
              frecuencia7 *
              100
            ),

          emparejamiento:
            Math.round(
              emparejamiento *
              100
            ),

          emparejamientoReciente:
            Math.round(
              emparejamientoReciente *
              100
            ),

          transicion:
            Math.round(
              transicion *
              100
            ),

          regularidad:
            Math.round(
              regularidad *
              100
            ),

          tendenciaReciente:
            Math.round(
              tendenciaReciente *
              100
            )

        };

      }
    );


  /*
  ==========================================
  ORDENAR CANDIDATOS
  ==========================================
  */

  candidatosPronostico.sort(
    (a, b) => {

      /*
      1. ÍNDICE XTREME
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
      2. CONFLUENCIA RECIENTE
      */

      if (
        b.emparejamientoReciente !==
        a.emparejamientoReciente
      ) {

        return (
          b.emparejamientoReciente -
          a.emparejamientoReciente
        );

      }


      /*
      3. TRANSICIÓN
      */

      if (
        b.transicion !==
        a.transicion
      ) {

        return (
          b.transicion -
          a.transicion
        );

      }


      /*
      4. 7 DÍAS
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
      5. 14 DÍAS
      */

      if (
        b.salidas14 !==
        a.salidas14
      ) {

        return (
          b.salidas14 -
          a.salidas14
        );

      }


      /*
      6. REGULARIDAD
      */

      if (
        b.regularidad !==
        a.regularidad
      ) {

        return (
          b.regularidad -
          a.regularidad
        );

      }


      /*
      7. ATRASO
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


      return (
        b.salidas30 -
        a.salidas30
      );

    }
  );


  /*
  ==========================================
  CANDIDATOS VÁLIDOS
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
        20
      );


  /*
  ==========================================
  PRONÓSTICO XTREME
  ==========================================

  YA NO HAY SEMILLA ALEATORIA.

  Los 3 salen de los mejores candidatos
  estadísticos.

  Esto hace que el pronóstico sea
  reproducible y explicable.
  ==========================================
  */

  const pronosticos =
    candidatos
      .slice(
        0,
        3
      )
      .map(
        animal => ({

          ...animal,

          pronostico:
            true,

          categoria:
            "PRONÓSTICO"

        })
      );


  /*
  ==========================================
  NOMBRES DE PRONÓSTICOS
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
  RESULTADO FINAL DE LOS 77
  ==========================================
  */

  const resultado =
    candidatosPronostico.map(
      animal => {

        const nombre =
          normalizarAnimal(
            animal.animal
          );


        const esPronostico =
          nombresPronosticos.has(
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

          diasSinSalir:
            animal.diasSinSalir,

          indice:
            animal.indice,

          porcentaje:
            animal.indice,

          tendencia:
            esPronostico
              ? "PRONÓSTICO"
              : animal.tendencia,

          categoria:
            esPronostico
              ? "PRONÓSTICO"
              : animal.categoria,

          pronostico:
            esPronostico,

          frecuenciaHistorica:
            animal.frecuenciaHistorica,

          frecuencia30:
            animal.frecuencia30,

          frecuencia14:
            animal.frecuencia14,

          frecuencia7:
            animal.frecuencia7,

          emparejamiento:
            animal.emparejamiento,

          emparejamientoReciente:
            animal.emparejamientoReciente,

          transicion:
            animal.transicion,

          regularidad:
            animal.regularidad,

          tendenciaReciente:
            animal.tendenciaReciente

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
        b.emparejamientoReciente !==
        a.emparejamientoReciente
      ) {

        return (
          b.emparejamientoReciente -
          a.emparejamientoReciente
        );

      }


      if (
        b.transicion !==
        a.transicion
      ) {

        return (
          b.transicion -
          a.transicion
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
  DIAGNÓSTICO XTREME
  ==========================================
  */

  console.log(
    "XTREME MODELO ESTADÍSTICO:",
    {

      ahoraCaracas:
        `${horaCaracas}:00`,

      despuesDeLas10PM,

      fechaActual:
        hoyCaracas,

      fechaPronostico,

      fechaReferenciaPronostico,

      ultimoResultado:
        ultimoRegistro
          ? ultimoRegistro.animal
          : null,

      ultimaJornada:
        ultimosUnicos,

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
              animal.salidas30,

            emparejamiento:
              animal.emparejamiento,

            emparejamientoReciente:
              animal.emparejamientoReciente,

            transicion:
              animal.transicion,

            regularidad:
              animal.regularidad,

            tendenciaReciente:
              animal.tendenciaReciente

          })
        ),

      pronosticos:
        pronosticos.map(
          animal => ({

            animal:
              animal.animal,

            numero:
              animal.numero,

            indice:
              animal.indice,

            diasSinSalir:
              animal.diasSinSalir,

            emparejamiento:
              animal.emparejamiento,

            transicion:
              animal.transicion,

            regularidad:
              animal.regularidad,

            tendencia:
              animal.tendencia

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
