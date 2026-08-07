async function cargarResultados() {

  try {

    const respuesta = await fetch("/api/actualizar");
    const datos = await respuesta.json();

    if (!datos.ok) {
      document.getElementById("estadistica").innerHTML =
        "Error: " + datos.error;
      return;
    }

    document.getElementById("pronostico").innerHTML = `
      <h1>🔥 ${datos.pronostico.animal}</h1>
      <p>Índice XTREME: ${datos.pronostico.indice}%</p>
      <p>Salidas: ${datos.pronostico.salidas}</p>
      <p>Días sin salir: ${datos.pronostico.diasSinSalir}</p>
    `;

    let tabla = "";

    datos.top10.forEach((a, i) => {

      tabla += `
        <tr>
          <td>${i + 1}</td>
          <td>${a.animal}</td>
          <td>${a.salidas}</td>
          <td>${a.diasSinSalir}</td>
          <td>${a.indice}%</td>
        </tr>
      `;

    });

    document.getElementById("top10").innerHTML = tabla;

    document.getElementById("estadistica").innerHTML = `
      Historial almacenado: ${datos.historial}<br>
      Top 10 generado correctamente.
    `;

  } catch (e) {

    console.error(e);

    document.getElementById("estadistica").innerHTML =
      "Error cargando resultados.";

  }

}

document.getElementById("actualizar").addEventListener("click", cargarResultados);

cargarResultados();
