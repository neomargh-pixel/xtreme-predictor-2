export default function analizarResultados(historial) {

  if (!Array.isArray(historial) || historial.length === 0) {
    return [];
  }

  /*
  ==========================================
  NORMALIZAR FECHA
  ==========================================
  */

  function obtenerFecha(fecha) {

    if (!fecha) return null;

    const texto = String(fecha);

    const match = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
      return null;
    }

    return fechaObj.toISOString().slice(0, 10);
  }


  /*
  ==========================================
  DIFERENCIA DE DÍAS
  ==========================================
  */

  function diferenciaDias(fechaInicio, fechaFin) {

    const inicio =
      new Date(`${fechaInicio}T00:00:00Z`);

    const fin =
      new Date(`${fechaFin}T00:00:00Z`);

    return Math.max(
      0,
      Math.floor(
        (fin.getTime() - inicio.getTime()) /
        86400000
      )
    );
  }


  /*
  ==========================================
  PREPARAR REGISTROS
  ==========================================
  */

  const registros = historial
    .map(r => {

      const fecha = obtenerFecha(r.fecha);

      if (!fecha || !r.animal) {
        return null;
      }

      return {
        animal: String(r.animal)
          .trim()
          .toUpperCase(),

        fecha
      };

    })
    .filter(Boolean);


  if (registros.length === 0) {
    return [];
  }


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


  /*
  ==========================================
  FECHAS DE CORTE
  ==========================================
  */

  const fechaActual =
    new Date(`${fechaReferencia}T00:00:00Z`);

  const fecha7 = new Date(fechaActual);
  fecha7.setUTCDate(
    fecha7.getUTCDate() - 6
  );

  const fecha14 = new Date(fechaActual);
  fecha14.setUTCDate(
    fecha14.getUTCDate() - 13
  );

  const fecha30 = new Date(fechaActual);
  fecha30.setUTCDate(
    fecha30.getUTCDate() - 29
  );


  function fechaTexto(fecha) {

    return fecha
      .toISOString()
      .slice(0, 10);

  }


  const corte7 = fechaTexto(fecha7);
  const corte14 = fechaTexto(fecha14);
  const corte30 = fechaTexto(fecha30);


  /*
  ==========================================
  CREAR RANKING
  ==========================================
  */

  const ranking = {};


  registros.forEach(r => {

    if (!ranking[r.animal]) {

      ranking[r.animal] = {

        animal: r.animal,

        salidas: 0,

        salidas30: 0,

        salidas14: 0,

        salidas7: 0,

        ultimaFecha: r.fecha

      };

    }


    const a = ranking[r.animal];


    /*
    TOTAL
    */

    a.salidas++;


    /*
    ÚLTIMA SALIDA
    */

    if (r.fecha > a.ultimaFecha) {

      a.ultimaFecha = r.fecha;

    }


    /*
    30 DÍAS
    */

    if (r.fecha >= corte30) {

      a.salidas30++;

    }


    /*
    14 DÍAS
    */

    if (r.fecha >= corte14) {

      a.salidas14++;

    }


    /*
    7 DÍAS
    */

    if (r.fecha >= corte7) {

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


  const max7 = Math.max(
    ...valores.map(a => a.salidas7),
    1
  );


  const max14 = Math.max(
    ...valores.map(a => a.salidas14),
    1
  );


  const max30 = Math.max(
    ...valores.map(a => a.salidas30),
    1
  );


  /*
  ==========================================
  CREAR RESULTADO
  ==========================================
  */

  const resultado =
    valores.map(a => {

      const diasSinSalir =
        diferenciaDias(
          a.ultimaFecha,
          fechaReferencia
        );


      /*
      ========================================
      ACTIVIDAD
      ========================================

      La actividad sirve como respaldo.

      NO domina el pronóstico.
      */

      const puntuacion7 =
        (a.salidas7 / max7) * 12;


      const puntuacion14 =
        (a.salidas14 / max14) * 8;


      const puntuacion30 =
        (a.salidas30 / max30) * 5;


      /*
      ========================================
      PUNTUACIÓN POR ATRASO
      ========================================

      El atraso es ahora el factor principal.
      */

      let puntuacionAtraso = 0;


      if (diasSinSalir === 0) {

        puntuacionAtraso = 0;

      } else if (diasSinSalir === 1) {

        puntuacionAtraso = 3;

      } else if (diasSinSalir === 2) {

        puntuacionAtraso = 8;

      } else if (diasSinSalir === 3) {

        puntuacionAtraso = 15;

      } else if (diasSinSalir === 4) {

        puntuacionAtraso = 24;

      } else if (diasSinSalir === 5) {

        puntuacionAtraso = 34;

      } else if (diasSinSalir === 6) {

        puntuacionAtraso = 45;

      } else if (diasSinSalir === 7) {

        puntuacionAtraso = 56;

      } else if (diasSinSalir === 8) {

        puntuacionAtraso = 65;

      } else if (diasSinSalir === 9) {

        puntuacionAtraso = 72;

      } else if (diasSinSalir === 10) {

        puntuacionAtraso = 78;

      } else {

        puntuacionAtraso =
          Math.min(
            90,
            78 +
            ((diasSinSalir - 10) * 2)
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
      PENALIZACIÓN POR SALIDA RECIENTE
      ========================================

      ESTO ES CLAVE.

      Un animal recién salido pierde
      prioridad aunque tenga muchas salidas
      históricas.
      */

      if (diasSinSalir === 0) {

        indice -= 35;

      }


      if (diasSinSalir === 1) {

        indice -= 25;

      }


      if (diasSinSalir === 2) {

        indice -= 15;

      }


      if (diasSinSalir === 3) {

        indice -= 8;

      }


      /*
      ========================================
      ANIMALES MUY ACTIVOS PERO RECIENTES
      ========================================

      Evita que un animal que aparece mucho
      domine permanentemente el ranking.
      */

      if (
        diasSinSalir <= 1 &&
        a.salidas7 >= 3
      ) {

        indice -= 10;

      }


      if (
        diasSinSalir <= 2 &&
        a.salidas14 >= 8
      ) {

        indice -= 5;

      }


      /*
      ========================================
      BONIFICACIÓN POR ATRASO IMPORTANTE
      ========================================
      */

      if (diasSinSalir >= 7) {

        indice += 6;

      }


      if (diasSinSalir >= 10) {

        indice += 6;

      }


      if (diasSinSalir >= 14) {

        indice += 6;

      }


      /*
      ========================================
      BONIFICACIÓN MODERADA POR HISTORIAL
      ========================================

      El historial ayuda, pero NO manda.
      */

      if (a.salidas30 >= 10) {

        indice += 2;

      }


      if (a.salidas30 >= 15) {

        indice += 2;

      }


      /*
      ========================================
      LIMITAR 0 - 100
      ========================================
      */

      indice = Math.round(
        Math.max(
          0,
          Math.min(100, indice)
        )
      );


      /*
      ========================================
      TENDENCIA
      ========================================
      */

      let tendencia = "BAJA";


      if (indice >= 80) {

        tendencia = "MUY ALTA";

      } else if (indice >= 65) {

        tendencia = "ALTA";

      } else if (indice >= 50) {

        tendencia = "MEDIA";

      }


      /*
      ========================================
      CATEGORÍA
      ========================================
      */

      let categoria = "ATRASADO";


      if (indice >= 80) {

        categoria = "CALIENTE";

      } else if (indice >= 65) {

        categoria = "OBSERVACION";

      }


      return {

        animal: a.animal,

        salidas: a.salidas,

        salidas30: a.salidas30,

        salidas14: a.salidas14,

        salidas7: a.salidas7,

        diasSinSalir,

        indice,

        porcentaje: indice,

        tendencia,

        categoria

      };

    });


  /*
  ==========================================
  ORDEN FINAL
  ==========================================

  1. ÍNDICE
  2. DÍAS SIN SALIR
  3. 7 DÍAS
  4. 14 DÍAS
  5. 30 DÍAS
  6. HISTÓRICO
  ==========================================
  */

  resultado.sort((a, b) => {

    if (b.indice !== a.indice) {

      return b.indice -
             a.indice;

    }


    if (
      b.diasSinSalir !==
      a.diasSinSalir
    ) {

      return b.diasSinSalir -
             a.diasSinSalir;

    }


    if (
      b.salidas7 !==
      a.salidas7
    ) {

      return b.salidas7 -
             a.salidas7;

    }


    if (
      b.salidas14 !==
      a.salidas14
    ) {

      return b.salidas14 -
             a.salidas14;

    }


    if (
      b.salidas30 !==
      a.salidas30
    ) {

      return b.salidas30 -
             a.salidas30;

    }


    return b.salidas -
           a.salidas;

  });


  return resultado;

}
