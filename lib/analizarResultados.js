export default function analizarResultados(historial) {

  if (!Array.isArray(historial) || historial.length === 0) {
    return [];
  }

  const ranking = {};

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

  function convertirFecha(fecha) {
    return new Date(`${fecha}T00:00:00Z`);
  }

  function diferenciaDias(fechaInicio, fechaFin) {

    const inicio = convertirFecha(fechaInicio);
    const fin = convertirFecha(fechaFin);

    const diferencia =
      fin.getTime() - inicio.getTime();

    return Math.max(
      0,
      Math.floor(diferencia / 86400000)
    );
  }

  let fechaReferencia = null;

  /*
    ==================================================
    1. CONSTRUIR INFORMACIÓN DE CADA ANIMAL
    ==================================================
  */

  historial.forEach((r) => {

    if (!r.animal || !r.fecha) return;

    const fecha = obtenerFecha(r.fecha);

    if (!fecha) return;

    if (!fechaReferencia || fecha > fechaReferencia) {
      fechaReferencia = fecha;
    }

    const animal = String(r.animal).trim();

    if (!ranking[animal]) {

      ranking[animal] = {

        animal,

        salidas: 0,

        ultimaFecha: fecha,

        fechas: []

      };

    }

    ranking[animal].salidas++;

    ranking[animal].fechas.push(fecha);

    if (
      fecha >
      ranking[animal].ultimaFecha
    ) {

      ranking[animal].ultimaFecha = fecha;

    }

  });

  if (!fechaReferencia) {
    return [];
  }

  /*
    ==================================================
    2. FECHAS DE REFERENCIA
    ==================================================
  */

  const fechaRef =
    convertirFecha(fechaReferencia);

  const fecha30 =
    new Date(fechaRef);

  fecha30.setUTCDate(
    fecha30.getUTCDate() - 29
  );

  const fecha14 =
    new Date(fechaRef);

  fecha14.setUTCDate(
    fecha14.getUTCDate() - 13
  );

  const fecha7 =
    new Date(fechaRef);

  fecha7.setUTCDate(
    fecha7.getUTCDate() - 6
  );

  /*
    ==================================================
    3. ANALIZAR CADA ANIMAL
    ==================================================
  */

  const resultado =
    Object.values(ranking).map((a) => {

      const diasSinSalir =
        diferenciaDias(
          a.ultimaFecha,
          fechaReferencia
        );

      let salidas30 = 0;
      let salidas14 = 0;
      let salidas7 = 0;

      a.fechas.forEach((fecha) => {

        const fechaAnimal =
          convertirFecha(fecha);

        if (fechaAnimal >= fecha30) {
          salidas30++;
        }

        if (fechaAnimal >= fecha14) {
          salidas14++;
        }

        if (fechaAnimal >= fecha7) {
          salidas7++;
        }

      });

      /*
        ==============================================
        FRECUENCIA GENERAL
        ==============================================
      */

      const frecuenciaGeneral =
        Math.min(
          100,
          (a.salidas / 25) * 100
        );

      /*
        ==============================================
        TENDENCIA 30 DÍAS
        ==============================================
      */

      const tendencia30 =
        Math.min(
          100,
          (salidas30 / 18) * 100
        );

      /*
        ==============================================
        TENDENCIA 14 DÍAS
        ==============================================
      */

      const tendencia14 =
        Math.min(
          100,
          (salidas14 / 10) * 100
        );

      /*
        ==============================================
        TENDENCIA 7 DÍAS
        ==============================================
      */

      const tendencia7 =
        Math.min(
          100,
          (salidas7 / 6) * 100
        );

      /*
        ==============================================
        RECENCIA
        ==============================================

        Premia animales que han salido recientemente,
        pero también considera los que llevan algunos
        días sin aparecer.

        No dejamos que 30 días de ausencia dominen
        todo el cálculo.
      */

      const recencia =
        Math.max(
          0,
          100 - (diasSinSalir * 8)
        );

      /*
        ==============================================
        FACTOR DE AUSENCIA
        ==============================================

        Un atraso moderado suma valor.

        Un animal que lleva muchísimo tiempo sin
        aparecer NO recibe automáticamente una
        puntuación enorme.
      */

      const ausencia =
        Math.min(
          100,
          diasSinSalir * 6
        );

      /*
        ==============================================
        PUNTUACIÓN XTREME
        ==============================================

        30% frecuencia general
        25% tendencia 30 días
        20% tendencia 14 días
        15% tendencia 7 días
        10% recencia

        La ausencia se utiliza como ajuste pequeño
        para detectar animales interesantes.
      */

      let indice =

        (frecuenciaGeneral * 0.30) +

        (tendencia30 * 0.25) +

        (tendencia14 * 0.20) +

        (tendencia7 * 0.15) +

        (recencia * 0.10);

      /*
        BONUS POR AUSENCIA MODERADA

        Máximo +8 puntos.

        Esto evita que un animal con 31 días sin salir
        se convierta automáticamente en el pronóstico.
      */

      const bonusAusencia =
        Math.min(
          8,
          ausencia * 0.08
        );

      indice += bonusAusencia;

      indice = Math.round(
        Math.min(100, indice)
      );

      /*
        ==============================================
        CLASIFICACIÓN DE TENDENCIA
        ==============================================
      */

      let tendencia = "BAJA";

      if (indice >= 75) {
        tendencia = "MUY ALTA";
      } else if (indice >= 60) {
        tendencia = "ALTA";
      } else if (indice >= 45) {
        tendencia = "MEDIA";
      }

      return {

        animal: a.animal,

        salidas: a.salidas,

        salidas30,

        salidas14,

        salidas7,

        diasSinSalir,

        indice,

        porcentaje: indice,

        tendencia

      };

    });

  /*
    ==================================================
    4. ORDENAR POR ÍNDICE XTREME
    ==================================================
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

    return b.salidas - a.salidas;

  });

  return resultado;

}
