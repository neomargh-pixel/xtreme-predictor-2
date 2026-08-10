export default function analizarResultados(historial) {

  if (!Array.isArray(historial) || historial.length === 0) {
    return [];
  }

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
  FECHA MÁS RECIENTE
  ==========================================
  */

  let fechaReferencia = null;

  historial.forEach(r => {

    const fecha = obtenerFecha(r.fecha);

    if (!fecha) return;

    if (
      !fechaReferencia ||
      fecha > fechaReferencia
    ) {
      fechaReferencia = fecha;
    }

  });


  if (!fechaReferencia) {
    return [];
  }


  /*
  ==========================================
  CREAR LISTA DE ANIMALES
  ==========================================
  */

  const ranking = {};


  historial.forEach(r => {

    if (!r.animal || !r.fecha) return;

    const fecha = obtenerFecha(r.fecha);

    if (!fecha) return;


    if (!ranking[r.animal]) {

      ranking[r.animal] = {

        animal: r.animal,

        salidas: 0,

        salidas30: 0,

        salidas14: 0,

        salidas7: 0,

        ultimaFecha: fecha

      };

    }


    const a = ranking[r.animal];


    a.salidas++;


    if (fecha > a.ultimaFecha) {
      a.ultimaFecha = fecha;
    }


    const dias =
      diferenciaDias(
        fecha,
        fechaReferencia
      );


    if (dias <= 30) {
      a.salidas30++;
    }

    if (dias <= 14) {
      a.salidas14++;
    }

    if (dias <= 7) {
      a.salidas7++;
    }

  });


  /*
  ==========================================
  CALCULAR RESULTADO
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
      PUNTUACIÓN NUEVA

      Mucho más peso a lo reciente.
      ========================================
      */

      let indice = 0;


      // Últimos 7 días
      indice += a.salidas7 * 4;


      // Últimos 14 días
      indice += a.salidas14 * 2;


      // Últimos 30 días
      indice += a.salidas30;


      // Tendencia por atraso moderado
      if (
        diasSinSalir >= 1 &&
        diasSinSalir <= 3
      ) {
        indice += 3;
      }


      /*
      ========================================
      PENALIZACIÓN POR ESTAR DEMASIADO ATRASADO
      ========================================
      */

      if (diasSinSalir >= 10) {
        indice -= 5;
      }


      if (diasSinSalir >= 20) {
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

      let categoria = "FRIO";

      if (indice >= 80) {

        categoria = "CALIENTE";

      } else if (indice >= 50) {

        categoria = "OBSERVACION";

      } else if (diasSinSalir >= 5) {

        categoria = "ATRASADO";

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
  ORDENAR
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

    return b.salidas30 - a.salidas30;

  });


  return resultado;

}
