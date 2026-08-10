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
      ACTIVIDAD RECIENTE
      ========================================
      */

      const puntuacion7 =
        (a.salidas7 / max7) * 25;

      const puntuacion14 =
        (a.salidas14 / max14) * 20;

      const puntuacion30 =
        (a.salidas30 / max30) * 15;


      /*
      ========================================
      ATRASO
      ========================================

      AHORA EL ATRASO TIENE MUCHO MÁS PESO.

      0 días  = 0
      1 día   = 2
      2 días  = 5
      3 días  = 9
      4 días  = 14
      5 días  = 20
      6 días  = 26
      7 días  = 32
      8 días  = 38
      9 días  = 44
      10+     = 50
      ========================================
      */

      const atrasoTabla = [
        0,
        2,
        5,
        9,
        14,
        20,
        26,
        32,
        38,
        44,
        50
      ];

      const puntuacionAtraso =
        atrasoTabla[
          Math.min(diasSinSalir, 10)
        ];


      /*
      ========================================
      BASE XTREME
      ========================================
      */

      let indice =
        puntuacion7 +
        puntuacion14 +
        puntuacion30 +
        puntuacionAtraso;


      /*
      ========================================
      BONIFICACIÓN POR FRECUENCIA
      ========================================
      */

      if (a.salidas30 >= 10) {
        indice += 4;
      }

      if (a.salidas30 >= 15) {
        indice += 3;
      }


      /*
      ========================================
      PENALIZACIÓN POR HABER SALIDO RECIENTEMENTE
      ========================================

      Esto es lo que evita que el mismo animal
      permanezca eternamente como pronóstico.

      Si salió recientemente:

      0 días  -> -25
      1 día   -> -20
      2 días  -> -14
      3 días  -> -8

      Después comienza a recuperar fuerza.
      */

      if (diasSinSalir === 0) {

        indice -= 25;

      } else if (diasSinSalir === 1) {

        indice -= 20;

      } else if (diasSinSalir === 2) {

        indice -= 14;

      } else if (diasSinSalir === 3) {

        indice -= 8;

      }


      /*
      ========================================
      PENALIZACIÓN POR ACTIVIDAD DEMASIADO
      RECIENTE
      ========================================
      */

      if (
        diasSinSalir <= 1 &&
        a.salidas7 >= 3
      ) {

        indice -= 8;

      }


      /*
      ========================================
      SI LLEVA 7+ DÍAS SIN SALIR
      ========================================
      */

      if (diasSinSalir >= 7) {

        indice += 5;

      }


      /*
      ========================================
      SI LLEVA 10+ DÍAS
      ========================================
      */

      if (diasSinSalir >= 10) {

        indice += 5;

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

    /*
    PRIMERO:
    índice
    */

    if (b.indice !== a.indice) {

      return b.indice - a.indice;

    }


    /*
    SEGUNDO:
    días sin salir
    */

    if (b.diasSinSalir !== a.diasSinSalir) {

      return b.diasSinSalir - a.diasSinSalir;

    }


    /*
    TERCERO:
    actividad reciente
    */

    if (b.salidas7 !== a.salidas7) {

      return b.salidas7 - a.salidas7;

    }


    /*
    CUARTO:
    14 días
    */

    if (b.salidas14 !== a.salidas14) {

      return b.salidas14 - a.salidas14;

    }


    /*
    QUINTO:
    30 días
    */

    if (b.salidas30 !== a.salidas30) {

      return b.salidas30 - a.salidas30;

    }


    /*
    SEXTO:
    HISTÓRICO
    */

    return b.salidas - a.salidas;

  });


  return resultado;

}
