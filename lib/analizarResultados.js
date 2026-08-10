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
  CONSTRUIR REGISTROS
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
  VALORES MÁXIMOS
  ==========================================
  */

  const animales =
    Object.values(ranking);


  const max7 = Math.max(
    1,
    ...animales.map(a => a.salidas7)
  );

  const max14 = Math.max(
    1,
    ...animales.map(a => a.salidas14)
  );

  const max30 = Math.max(
    1,
    ...animales.map(a => a.salidas30)
  );


  /*
  ==========================================
  CREAR RESULTADO
  ==========================================
  */

  const resultado =
    animales.map(a => {

      const diasSinSalir =
        diferenciaDias(
          a.ultimaFecha,
          fechaReferencia
        );


      /*
      ========================================
      1. FRECUENCIA RECIENTE
      ========================================

      Peso total aproximado: 35%
      ========================================
      */

      const frecuencia7 =
        (a.salidas7 / max7) * 18;

      const frecuencia14 =
        (a.salidas14 / max14) * 10;

      const frecuencia30 =
        (a.salidas30 / max30) * 7;


      const frecuencia =
        frecuencia7 +
        frecuencia14 +
        frecuencia30;


      /*
      ========================================
      2. TENDENCIA
      ========================================

      Detectamos si el animal está aumentando
      su actividad recientemente.
      ========================================
      */

      const promedioAnterior =
        Math.max(
          0,
          a.salidas14 - a.salidas7
        );


      let tendenciaPuntos = 0;


      if (
        a.salidas7 > promedioAnterior
      ) {

        tendenciaPuntos = 25;

      } else if (
        a.salidas7 === promedioAnterior &&
        a.salidas7 > 0
      ) {

        tendenciaPuntos = 18;

      } else if (
        a.salidas7 > 0
      ) {

        tendenciaPuntos = 10;

      }


      /*
      ========================================
      3. ATRASO
      ========================================

      ESTE ES EL CAMBIO PRINCIPAL.

      Mientras más días sin salir,
      mayor puntuación.

      El atraso puede aportar hasta 40 puntos.
      ========================================
      */

      let atrasoPuntos = 0;


      if (diasSinSalir >= 20) {

        atrasoPuntos = 40;

      } else if (diasSinSalir >= 15) {

        atrasoPuntos = 36;

      } else if (diasSinSalir >= 12) {

        atrasoPuntos = 32;

      } else if (diasSinSalir >= 10) {

        atrasoPuntos = 28;

      } else if (diasSinSalir >= 8) {

        atrasoPuntos = 24;

      } else if (diasSinSalir >= 6) {

        atrasoPuntos = 20;

      } else if (diasSinSalir >= 4) {

        atrasoPuntos = 14;

      } else if (diasSinSalir >= 2) {

        atrasoPuntos = 8;

      } else if (diasSinSalir === 1) {

        atrasoPuntos = 4;

      }


      /*
      ========================================
      4. PENALIZACIÓN POR FRIALDAD EXTREMA
      ========================================
      */

      let penalizacion = 0;


      /*
      Si lleva 7 días o más sin salir,
      no debe recibir una penalización fuerte.

      El atraso es precisamente una señal
      que queremos analizar.
      */

      if (
        diasSinSalir < 7 &&
        a.salidas7 === 0
      ) {

        penalizacion += 8;

      }


      /*
      Si nunca apareció en 30 días,
      bajamos su confianza.
      */

      if (a.salidas30 === 0) {

        penalizacion += 15;

      }


      /*
      ========================================
      5. BONIFICACIÓN POR ACTIVIDAD
      ========================================
      */

      let actividadBonus = 0;


      if (a.salidas7 >= 3) {
        actividadBonus += 3;
      }

      if (a.salidas7 >= 5) {
        actividadBonus += 2;
      }


      /*
      ========================================
      ÍNDICE FINAL
      ========================================
      */

      let indice =
        frecuencia +
        tendenciaPuntos +
        atrasoPuntos +
        actividadBonus -
        penalizacion;


      /*
      ========================================
      EVITAR 100 AUTOMÁTICO
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

    /*
    PRIMERO: ÍNDICE
    */

    if (b.indice !== a.indice) {

      return b.indice - a.indice;

    }


    /*
    SEGUNDO: MÁS ATRASADO
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
    TERCERO: ACTIVIDAD 7 DÍAS
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
    CUARTO: ACTIVIDAD 14 DÍAS
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
    QUINTO: ACTIVIDAD 30 DÍAS
    */

    if (
      b.salidas30 !==
      a.salidas30
    ) {

      return (
        b.salidas30 -
        a.salidas30
      );

    }


    /*
    SEXTO: TOTAL HISTÓRICO
    */

    return b.salidas - a.salidas;

  });


  return resultado;

}
