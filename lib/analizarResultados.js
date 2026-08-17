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

    if (!valor) {
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

  function obtenerFecha(fecha) {

    if (!fecha) {
      return null;
    }

    const texto = String(fecha);

    const match = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {

      return (
        match[1] +
        "-" +
        match[2] +
        "-" +
        match[3]
      );

    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
      return null;
    }

    return fechaObj
      .toISOString()
      .slice(0, 10);

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

    if (
      !fechaInicio ||
      !fechaFin
    ) {

      return 0;

    }

    const inicio =
      new Date(
        `${fechaInicio}T00:00:00Z`
      );

    const fin =
      new Date(
        `${fechaFin}T00:00:00Z`
      );

    if (
      isNaN(inicio.getTime()) ||
      isNaN(fin.getTime())
    ) {

      return 0;

    }

    return Math.max(
      0,
      Math.floor(
        (
          fin.getTime() -
          inicio.getTime()
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

  const mapaOficial = new Map();

  animalesOficiales.forEach(a => {

    mapaOficial.set(
      normalizarAnimal(a.animal),
      a
    );

  });


  /*
  ==========================================
  PREPARAR HISTORIAL
  ==========================================
  */

  const registros =
    historial
      .map(r => {

        const fecha =
          obtenerFecha(r.fecha);

        const nombre =
          normalizarAnimal(r.animal);

        if (
          !fecha ||
          !nombre
        ) {

          return null;

        }

        if (
          !mapaOficial.has(nombre)
        ) {

          return null;

        }

        const oficial =
          mapaOficial.get(nombre);

        return {

          animalClave: nombre,

          animal: oficial.animal,

          numero: oficial.numero,

          fecha

        };

      })
      .filter(Boolean);


  /*
  ==========================================
  FECHA DE REFERENCIA
  ==========================================
  */

  let fechaReferencia = null;

  registros.forEach(r => {

    if (
      !fechaReferencia ||
      r.fecha > fechaReferencia
    ) {

      fechaReferencia = r.fecha;

    }

  });


  if (!fechaReferencia) {

    return resultadoSinDatos();

  }


  /*
  ==========================================
  FECHAS DE CORTE
  ==========================================
  */

  const fechaActual =
    new Date(
      `${fechaReferencia}T00:00:00Z`
    );

  const fecha7 =
    new Date(fechaActual);

  fecha7.setUTCDate(
    fecha7.getUTCDate() - 6
  );

  const fecha14 =
    new Date(fechaActual);

  fecha14.setUTCDate(
    fecha14.getUTCDate() - 13
  );

  const fecha30 =
    new Date(fechaActual);

  fecha30.setUTCDate(
    fecha30.getUTCDate() - 29
  );


  function fechaTexto(fecha) {

    return fecha
      .toISOString()
      .slice(0, 10);

  }


  const corte7 =
    fechaTexto(fecha7);

  const corte14 =
    fechaTexto(fecha14);

  const corte30 =
    fechaTexto(fecha30);


  /*
  ==========================================
  CREAR RANKING DE LOS 77
  ==========================================
  */

  const ranking = {};

  animalesOficiales.forEach(a => {

    ranking[
      normalizarAnimal(a.animal)
    ] = {

      numero: a.numero,

      animal: a.animal,

      salidas: 0,

      salidas30: 0,

      salidas14: 0,

      salidas7: 0,

      ultimaFecha: null

    };

  });


  /*
  ==========================================
  CONTAR HISTORIAL
  ==========================================
  */

  registros.forEach(r => {

    const a =
      ranking[r.animalClave];

    if (!a) {
      return;
    }

    a.salidas++;

    if (
      !a.ultimaFecha ||
      r.fecha > a.ultimaFecha
    ) {

      a.ultimaFecha =
        r.fecha;

    }

    if (
      r.fecha >= corte30
    ) {

      a.salidas30++;

    }

    if (
      r.fecha >= corte14
    ) {

      a.salidas14++;

    }

    if (
      r.fecha >= corte7
    ) {

      a.salidas7++;

    }

  });


  /*
  ==========================================
  VALORES MÁXIMOS
  ==========================================
  */

  const valores =
    Object.values(ranking);

  const max7 =
    Math.max(
      ...valores.map(
        a => a.salidas7
      ),
      1
    );

  const max14 =
    Math.max(
      ...valores.map(
        a => a.salidas14
      ),
      1
    );

  const max30 =
    Math.max(
      ...valores.map(
        a => a.salidas30
      ),
      1
    );


  /*
  ==========================================
  CONSTRUIR RESULTADO
  ==========================================
  */

  const resultado =
    valores.map(a => {

      const diasSinSalir =
        a.ultimaFecha
          ? diferenciaDias(
              a.ultimaFecha,
              fechaReferencia
            )
          : 999;


      /*
      ========================================
      PUNTUACIÓN DE ACTIVIDAD
      ========================================
      */

      const puntuacion7 =
        (
          a.salidas7 /
          max7
        ) * 15;

      const puntuacion14 =
        (
          a.salidas14 /
          max14
        ) * 10;

      const puntuacion30 =
        (
          a.salidas30 /
          max30
        ) * 5;


      /*
      ========================================
      PUNTUACIÓN POR ATRASO
      ========================================
      */

      let puntuacionAtraso = 0;

      if (
        diasSinSalir === 999
      ) {

        /*
        Animal sin historial reciente.
        No lo convertimos automáticamente
        en favorito.
        */

        puntuacionAtraso = 18;

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
      ========================================
      ÍNDICE BASE
      ========================================
      */

      let indice =
        puntuacionAtraso +
        puntuacion7 +
        puntuacion14 +
        puntuacion30;


      /*
      ========================================
      PENALIZAR SALIDAS RECIENTES
      ========================================
      */

      if (
        diasSinSalir === 0
      ) {

        indice -= 35;

      }

      else if (
        diasSinSalir === 1
      ) {

        indice -= 22;

      }

      else if (
        diasSinSalir === 2
      ) {

        indice -= 12;

      }


      /*
      ========================================
      EVITAR ANIMALES DEMASIADO ACTIVOS
      ========================================
      */

      if (
        a.salidas7 >= 3 &&
        diasSinSalir <= 2
      ) {

        indice -= 10;

      }

      if (
        a.salidas14 >= 7 &&
        diasSinSalir <= 3
      ) {

        indice -= 6;

      }


      /*
      ========================================
      PREMIO MODERADO POR ATRASO
      ========================================
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
      ========================================
      FRECUENCIA HISTÓRICA MODERADA
      ========================================
      */

      if (
        a.salidas30 >= 8
      ) {

        indice += 2;

      }

      if (
        a.salidas30 >= 14
      ) {

        indice += 2;

      }


      /*
      ========================================
      LIMITAR ÍNDICE
      ========================================
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
      ========================================
      TENDENCIA
      ========================================
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
      ========================================
      CATEGORÍA
      ========================================
      */

      let categoria =
        "ATRASADO";

      if (
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
          a.numero,

        animal:
          a.animal,

        salidas:
          a.salidas,

        salidas30:
          a.salidas30,

        salidas14:
          a.salidas14,

        salidas7:
          a.salidas7,

        diasSinSalir:
          diasSinSalir === 999
            ? 0
            : diasSinSalir,

        indice,

        porcentaje:
          indice,

        tendencia,

        categoria,

        pronostico:
          false

      };

    });


  /*
  ==========================================
  ORDENAR POR FUERZA ESTADÍSTICA
  ==========================================
  */

  resultado.sort(
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

      return (
        b.salidas30 -
        a.salidas30
      );

    }
  );


  /*
  ==========================================
  SELECCIÓN DIARIA
  ==========================================

  NO usamos siempre resultado[0].

  Tomamos un grupo de candidatos fuertes.

  Esto evita que un único animal domine
  indefinidamente el pronóstico.
  */

  const candidatos =
    resultado
      .filter(a =>
        a.indice >= 45
      )
      .slice(
        0,
        12
      );


  /*
  ==========================================
  SI HAY MUY POCOS CANDIDATOS
  ==========================================
  */

  if (
    candidatos.length < 5
  ) {

    resultado
      .filter(
        a =>
          !candidatos.includes(a)
      )
      .slice(
        0,
        5 - candidatos.length
      )
      .forEach(a => {

        candidatos.push(a);

      });

  }


  /*
  ==========================================
  SEMILLA DIARIA
  ==========================================

  La fecha cambia la selección.

  No usamos Math.random(),
  porque queremos que el resultado
  sea estable durante el mismo día.
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

    return Math.abs(hash);

  }


  const semilla =
    crearSemilla(
      fechaReferencia
    );


  /*
  ==========================================
  ROTACIÓN DIARIA
  ==========================================

  El primer candidato no gana
  automáticamente.

  La fecha determina cuál posición
  del grupo fuerte será seleccionada.
  */

  const posicion =
    semilla %
    candidatos.length;


  const seleccionado =
    candidatos[posicion];


  /*
  ==========================================
  MARCAR PRONÓSTICO
  ==========================================
  */

  if (
    seleccionado
  ) {

    seleccionado.pronostico =
      true;

    seleccionado.categoria =
      "PRONÓSTICO";

  }


  /*
  ==========================================
  SEGURIDAD FINAL
  ==========================================
  */

  return resultado.slice(
    0,
    77
  );

}
