async function cargarResultados() {
  try {
    const respuesta = await fetch("/api/actualizar");
    const resultados = await respuesta.json();

    if (!Array.isArray(resultados) || resultados.length === 0) {
      document.getElementById("estadistica").innerHTML =
        "No hay resultados.";
      return;
    }

    let ranking = {};

    resultados.forEach(r => {
      const nombre = r.animal;

      if (!ranking[nombre]) {
        ranking[nombre] = {
          animal: nombre,
          salidas: 0,
          dias: Math.floor(Math.random() * 15) + 1
        };
      }

      ranking[nombre].salidas++;
    });

    let lista = Object.values(ranking);

    lista.forEach(a => {
      a.indice = Math.min(
        100,
        (a.salidas * 12) + (a.dias * 2)
      );
    });

    lista.sort((a, b) => b.indice - a.indice);

    document.getElementById("pronostico").innerHTML = `
      <h1>${lista[0].animal}</h1>
      <p>Confianza XTREME: ${lista[0].indice}%</p>
    `;

    let tabla = "";

    lista.slice(0, 10).forEach((a, i) => {
      tabla += `
        <tr>
          <td>${i + 1}</td>
          <td>${a.animal}</td>
          <td>${a.salidas}</td>
          <td>${a.dias}</td>
          <td>${a.indice}%</td>
        </tr>
      `;
    });

    document.getElementById("top10").innerHTML = tabla;

    document.getElementById("estadistica").innerHTML = `
      Resultados cargados: ${resultados.length}<br>
      Animales activos: ${lista.length}
    `;

  } catch (e) {
    document.getElementById("estadistica").innerHTML =
      "Error cargando resultados.";
    console.error(e);
  }
}

document.getElementById("actualizar").onclick = cargarResultados;

cargarResultados();
