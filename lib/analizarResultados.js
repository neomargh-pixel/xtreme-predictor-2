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
  fecha7.setUTCDate(fecha7.getUTCDate() - 6);

  const fecha14 = new Date(fechaActual);
  fecha14.setUTCDate(fecha14.getUTCDate() - 13);

  const fecha30 = new Date(fechaActual);
  fecha30.setUTCDate(fecha30.getUTCDate() - 29);


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
  CREAR RESULTADO
  ==========================================
  */

  const resultado =
    Object.values(ranking).map(a => {


      const diasSinSalir =
        diferenciaDias(
          a.ultimaFecha,
          fechaReferencia
        );


      /*
      ========================================
      PUNTUACIÓN XTREME
      ========================================

      Ahora la actividad reciente pesa mucho más.

      7 días  = 45%
      14 días = 30%
      30 días = 15%
      atraso  = 10%

      El histórico total ya NO domina
      el pronóstico.
      ========================================
      */


      const max7 = Math.max(
        ...Object.values(ranking)
          .map(x => x.salidas7)
      );

      const max14 = Math.max(
        ...Object.values(ranking)
          .map(x => x.salidas14)
      );

      const max30 = Math.max(
        ...Object.values(ranking)
          .map(x => x.salidas30)
      );


      const puntuacion7 =
        max7 > 0
          ? (a.salidas7 / max7) * 45
          : 0;


      const puntuacion14 =
        max14 > 0
          ? (a.salidas14 / max14) * 30
          : 0;


      const puntuacion30 =
        max30 > 0
          ? (a.salidas30 / max30) * 15
          : 0;


      /*
      El atraso aporta un pequeño impulso,
      pero no puede convertir por sí solo
      a un animal frío en favorito.
      */

      const puntuacionAtraso =
        Math.min(diasSinSalir, 10) * 1;


      let indice =
        puntuacion7 +
        puntuacion14 +
        puntuacion30 +
        puntuacionAtraso;


      /*
      ========================================
      BONIFICACIÓN DE ACTIVIDAD RECIENTE
      ========================================
      */

      if (a.salidas7 >= 3) {

        indice += 3;

      }

      if (a.salidas7 >= 5) {

        indice += 2;

      }


      /*
      ========================================
      PENALIZACIÓN POR AUSENCIA RECIENTE
      ========================================
      */

      if (a.salidas7 === 0) {

        indice -= 8;

      }

      if (a.salidas14 === 0) {

        indice -= 5;

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

    return b.salidas - a.salidas;

  });


  return resultado;

}
