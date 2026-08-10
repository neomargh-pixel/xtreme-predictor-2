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
  FECHAS DEL HISTORIAL
  ==========================================
  */

  const registros = historial
    .map(r => {

      const fecha = obtenerFecha(r.fecha);

      if (!fecha || !r.animal) {
        return null;
      }

      return {
        animal: String(r.animal).trim().toUpperCase(),
        fecha
      };

    })
    .filter(Boolean);


  if (registros.length === 0) {
    return [];
  }


  /*
  ==========================================
  FECHA MÁS RECIENTE
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

    return fecha.toISOString().slice(0, 10);

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
    TOTAL HISTÓRICO
    */

    a.salidas++;


    /*
    ÚLTIMA SALIDA
    */

    if (r.fecha > a.ultimaFecha) {

      a.ultimaFecha = r.fecha;

    }


    /*
    ÚLTIMOS 30 DÍAS
    */

    if (r.fecha >= corte30) {

      a.salidas30++;

    }


    /*
    ÚLTIMOS 14 DÍAS
    */

    if (r.fecha >= corte14) {

      a.salidas14++;

    }


    /*
    ÚLTIMOS 7 DÍAS
    */

    if (r.fecha >= corte7) {

      a.salidas7++;

    }

  });


  /*
  ==========================================
  MÁXIMOS DE CADA PERÍODO
  ==========================================
  */

  const valores =
    Object.values(ranking);

  const max7 = Math.max(
    1,
    ...valores.map(a => a.salidas7)
  );

  const max14 = Math.max(
    1,
    ...valores.map(a => a.salidas14)
  );

  const max30 = Math.max(
    1,
    ...valores.map(a => a.salidas30)
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
      PUNTUACIÓN BASE
      ========================================

      La actividad reciente sigue teniendo
      el mayor peso.

      7 días  = 40%
      14 días = 25%
      30 días = 15%

      Total base = 80%
      ========================================
      */

      const puntuacion7 =
        (a.salidas7 / max7) * 40;

      const puntuacion14 =
        (a.salidas14 / max14) * 25;

      const puntuacion30 =
        (a.salidas30 / max30) * 15;


      /*
      ========================================
      ACELERACIÓN
      ========================================

      Comparamos la actividad de los últimos
      7 días contra el promedio de las semanas
      anteriores.

      Esto permite que otro animal suba cuando
      esté tomando fuerza recientemente.
      ========================================
      */

      const promedioAnterior7 =
        Math.max(
          0,
          (a.salidas14 - a.salidas7) / 7
        );

      const actividadReciente =
        a.salidas7 / 7;

      let aceleracion = 0;

      if (
        actividadReciente >
        promedioAnterior7
      ) {

        aceleracion = 10;

      } else if (
        actividadReciente ===
        promedioAnterior7
      ) {

        aceleracion = 5;

      }


      /*
      ========================================
      RECENCIA
      ========================================
      */

      let recencia = 0;

      if (diasSinSalir === 0) {

        recencia = 5;

      } else if (diasSinSalir === 1) {

        recencia = 4;

      } else if (diasSinSalir === 2) {

        recencia = 3;

      } else if (diasSinSalir === 3) {

        recencia = 2;

      } else if (diasSinSalir === 4) {

        recencia = 1;

      }


      /*
      ========================================
      PENALIZACIÓN POR AUSENCIA
      ========================================
      */

      let penalizacion = 0;

      if (a.salidas7 === 0) {

        penalizacion += 12;

      }

      if (a.salidas14 === 0) {

        penalizacion += 8;

      }


      /*
      ========================================
      ATRASO EXTREMO
      ========================================

      Un atraso grande no convierte
      automáticamente al animal en favorito.
      ========================================
      */

      if (diasSinSalir >= 10) {

        penalizacion += 8;

      } else if (diasSinSalir >= 7) {

        penalizacion += 5;

      }


      /*
      ========================================
      ÍNDICE XTREME
      ========================================
      */

      let indice =
        puntuacion7 +
        puntuacion14 +
        puntuacion30 +
        aceleracion +
        recencia -
        penalizacion;


      /*
      ========================================
      BONIFICACIÓN CONTROLADA
      ========================================
      */

      if (a.salidas7 >= 3) {

        indice += 2;

      }

      if (a.salidas7 >= 5) {

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


      /*
      ========================================
      RESULTADO
      ========================================
      */

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
  */

  resultado.sort((a, b) => {

    if (b.indice !== a.indice) {

      return b.indice - a.indice;

    }

    if (b.salidas7 !== a.salidas7) {

      return b.salidas7 - a.salidas7;

    }

    if (b.salidas14 !== a.salidas14) {

      return b.salidas14 - a.salidas14;

    }

    if (b.salidas30 !== a.salidas30) {

      return b.salidas30 - a.salidas30;

    }

    if (b.diasSinSalir !== a.diasSinSalir) {

      return a.diasSinSalir - b.diasSinSalir;

    }

    return b.salidas - a.salidas;

  });


  return resultado;

}
