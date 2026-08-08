export default function analizarResultados(historial) {

  if (!Array.isArray(historial) || historial.length === 0) {
    return [];
  }

  const ranking = {};

  // Convierte cualquier fecha guardada a YYYY-MM-DD
  function obtenerFecha(fecha) {
    if (!fecha) return null;

    const texto = String(fecha);

    // Si viene como:
    // 2026-08-07T18:00:00-04:00
    // tomamos directamente 2026-08-07
    const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
      return null;
    }

    return fechaObj.toISOString().slice(0, 10);
  }

  // Diferencia de días entre dos fechas YYYY-MM-DD
  function diferenciaDias(fechaInicio, fechaFin) {

    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T00:00:00Z`);

    const diferencia =
      fin.getTime() - inicio.getTime();

    return Math.max(
      0,
      Math.floor(diferencia / 86400000)
    );
  }

  let fechaReferencia = null;

  historial.forEach((r) => {

    if (!r.animal || !r.fecha) return;

    const fecha = obtenerFecha(r.fecha);

    if (!fecha) return;

    // La fecha más reciente de todo el historial
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

    const diasSinSalir = diferenciaDias(
      a.ultimaFecha,
      fechaReferencia
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

  resultado.sort((a, b) => {

    if (b.indice !== a.indice) {
      return b.indice - a.indice;
    }

    if (b.diasSinSalir !== a.diasSinSalir) {
      return b.diasSinSalir - a.diasSinSalir;
    }

    return b.salidas - a.salidas;

  });

  return resultado;
}
