export default function analizarResultados(resultados) {

  const ranking = {};

  resultados.forEach((r) => {

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

  const hoy = new Date();

  const lista = Object.values(ranking).map((a) => {

    const dias = Math.floor(
      (hoy - new Date(a.ultimaFecha)) / 86400000
    );

    const indice = Math.min(
      100,
      (a.salidas * 10) + (dias * 2)
    );

    return {
      animal: a.animal,
      salidas: a.salidas,
      dias,
      indice
    };

  });

  lista.sort((a, b) => b.indice - a.indice);

  return lista;

}
