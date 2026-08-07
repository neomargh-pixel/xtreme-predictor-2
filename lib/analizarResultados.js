export default function analizarResultados(historial) {

  const ahora = new Date();
  const ranking = {};

  historial.forEach((r) => {

    if (!ranking[r.animal]) {
      ranking[r.animal] = {
        animal: r.animal,
        salidas: 0,
        ultimaFecha: r.fecha
      };
    }

    ranking[r.animal].salidas++;

    if (new Date(r.fecha) > new Date(ranking[r.animal].ultimaFecha)) {
      ranking[r.animal].ultimaFecha = r.fecha;
    }

  });

  const resultado = Object.values(ranking).map((a) => {

    const diasSinSalir = Math.floor(
      (ahora - new Date(a.ultimaFecha)) / 86400000
    );

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

  resultado.sort((a, b) => b.indice - a.indice);

  return resultado;

}
