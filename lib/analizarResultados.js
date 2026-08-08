export default function analizarResultados(historial) {

  if (!Array.isArray(historial) || historial.length === 0) {
    return [];
  }

  const ranking = {};

  // Encontrar la fecha más reciente del historial
  let fechaReferencia = null;

  historial.forEach((r) => {

    if (!r.fecha || !r.animal) return;

    const fecha = new Date(r.fecha);

    if (isNaN(fecha.getTime())) return;

    if (!fechaReferencia || fecha > fechaReferencia) {
      fechaReferencia = fecha;
    }

    if (!ranking[r.animal]) {
      ranking[r.animal] = {
        animal: r.animal,
        salidas: 0,
        ultimaFecha: fecha
      };
    }

    ranking[r.animal].salidas++;

    if (fecha > ranking[r.animal].ultimaFecha) {
      ranking[r.animal].ultimaFecha = fecha;
    }

  });

  if (!fechaReferencia) {
    return [];
  }

  const resultado = Object.values(ranking).map((a) => {

    // Diferencia entre la última salida del animal
    // y la fecha más reciente disponible
    const diferencia =
      fechaReferencia.getTime() -
      a.ultimaFecha.getTime();

    const diasSinSalir = Math.max(
      0,
      Math.floor(diferencia / 86400000)
    );

    // Índice de tendencia
    const indice =
      (a.salidas * 5) +
      (diasSinSalir * 2);

    return {
      animal: a.animal,
      salidas: a.salidas,
      diasSinSalir,
      indice
    };

  });

  // Mayor índice primero
  resultado.sort((a, b) => {

    if (b.indice !== a.indice) {
      return b.indice - a.indice;
    }

    // Si empatan, priorizar el que tenga
    // más días sin salir
    if (b.diasSinSalir !== a.diasSinSalir) {
      return b.diasSinSalir - a.diasSinSalir;
    }

    // Si todavía empatan, más salidas
    return b.salidas - a.salidas;

  });

  return resultado;
}
