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

    const d = new Date(fecha);

    if (isNaN(d.getTime())) {
      return null;
    }

    return d.toISOString().slice(0, 10);
  }

  function convertirFecha(fecha) {
    return new Date(`${fecha}T00:00:00Z`);
  }

  function diferenciaDias(inicio, fin) {

    const a = convertirFecha(inicio);
    const b = convertirFecha(fin);

    return Math.max(
      0,
      Math.floor(
        (b.getTime() - a.getTime()) / 86400000
      )
    );
  }

  let fechaReferencia = null;

  /*
  ==========================================
  RECOGER HISTORIAL
  ==========================================
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

    if (fecha > ranking[animal].ultimaFecha) {
      ranking[animal].ultimaFecha = fecha;
    }

  });

  if (!fechaReferencia) {
    return [];
  }

  const referencia = convertirFecha(fechaReferencia);

  const fecha30 = new Date(referencia);
  fecha30.setUTCDate(fecha30.getUTCDate() - 29);

  const fecha14 = new Date(referencia);
  fecha14.setUTCDate(fecha14.getUTCDate() - 13);

  const fecha7 = new Date(referencia);
  fecha7.setUTCDate(fecha7.getUTCDate() - 6);

  /*
  ==========================================
  ANALISIS
  ==========================================
  */

  const resultado = Object.values(ranking).map((a) => {

    const diasSinSalir = diferenciaDias(
      a.ultimaFecha,
      fechaReferencia
    );

    let salidas30 = 0;
    let salidas14 = 0;
    let salidas7 = 0;

    a.fechas.forEach((fecha) => {

      const d = convertirFecha(fecha);

      if (d >= fecha30) {
        salidas30++;
      }

      if (d >= fecha14) {
        salidas14++;
      }

      if (d >= fecha7) {
        salidas7++;
      }

    });

    /*
    ==========================================
    NORMALIZACIÓN
    ==========================================

    Ya NO dejamos que tener muchas salidas
    históricas domine el resultado.
    */

    const frecuencia30 =
      Math.min(100, salidas30 * 4);

    const tendencia14 =
      Math.min(100, salidas14 * 7);

    const tendencia7 =
      Math.min(100, salidas7 * 10);

    /*
    ==========================================
    RECENCIA
    ==========================================
    */

    const recencia =
      Math.max(
        0,
        100 - (diasSinSalir * 10)
      );

    /*
    ==========================================
    IMPULSO

    Compara los últimos 7 días contra
    los 14 días anteriores.
    ==========================================
    */

    const salidas7Anteriores =
      Math.max(
        0,
        salidas14 - salidas7
      );

    let impulso = 50;

    if (salidas7 > salidas7Anteriores) {
      impulso += 25;
    }

    if (salidas7 < salidas7Anteriores) {
      impulso -= 20;
    }

    impulso = Math.max(
      0,
      Math.min(100, impulso)
    );

    /*
    ==========================================
    AUSENCIA CONTROLADA

    No premiamos exageradamente un animal
    por estar meses sin salir.
    ==========================================
    */

    const ausencia =
      Math.min(
        100,
        diasSinSalir * 8
      );

    /*
    ==========================================
    ÍNDICE XTREME 2.0

    25% últimos 30 días
    25% últimos 14 días
    25% últimos 7 días
    15% impulso
    10% recencia
    */

    let indice =

      (frecuencia30 * 0.25) +

      (tendencia14 * 0.25) +

      (tendencia7 * 0.25) +

      (impulso * 0.15) +

      (recencia * 0.10);

    /*
    Pequeño ajuste por ausencia.

    Máximo +5 puntos.
    */

    indice += Math.min(
      5,
      ausencia * 0.05
    );

    indice = Math.round(
      Math.max(
        0,
        Math.min(100, indice)
      )
    );

    /*
    ==========================================
    TENDENCIA
    ==========================================
    */

    let tendencia = "BAJA";

    if (indice >= 80) {
      tendencia = "MUY ALTA";
    } else if (indice >= 65) {
      tendencia = "ALTA";
    } else if (indice >= 50) {
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

    return b.salidas30 - a.salidas30;

  });

  return resultado;
}
