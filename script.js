async function cargarResultados() {

  try {

    const respuesta = await fetch("/api/analizar");
    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(datos.error || "Error en el análisis");
    }

    // ==========================================
    // PRONÓSTICO
    // ==========================================

    const p = datos.pronostico;

    if (p) {

      document.getElementById("pronostico").innerHTML = `
        <h1>🔥 ${p.animal}</h1>
        <p>Índice XTREME: <strong>${p.indice}%</strong></p>
        <p>Tendencia: <strong>${p.tendencia}</strong></p>
        <p>Salidas: <strong>${p.salidas}</strong></p>
        <p>Días sin salir: <strong>${p.diasSinSalir}</strong></p>
        <p>Categoría: 🔥 <strong>${p.categoria}</strong></p>
      `;

    }

    // ==========================================
    // TOP 10
    // ==========================================

    const tablaTop = document.getElementById("top10");

    tablaTop.innerHTML = "";

    datos.top10.forEach((animal, index) => {

      tablaTop.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${animal.animal}</strong></td>
          <td>${animal.salidas}</td>
          <td>${animal.diasSinSalir}</td>
          <td>${animal.indice}%</td>
        </tr>
      `;

    });


    // ==========================================
    // ANIMALES ATRASADOS
    // ==========================================

    const tablaAtrasados =
      document.getElementById("atrasados");

    tablaAtrasados.innerHTML = "";

    if (datos.atrasados && datos.atrasados.length > 0) {

      datos.atrasados.forEach((animal, index) => {

        tablaAtrasados.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${animal.animal}</strong></td>
            <td>${animal.salidas}</td>
            <td>${animal.diasSinSalir}</td>
            <td>${animal.indice}%</td>
          </tr>
        `;

      });

    }


    // ==========================================
    // ANIMALITOS
    // ==========================================

    let html = "";

    animales.forEach(a => {

      const dato = datos.top10.find(
        x => x.animal === a.animal
      );

      let clase = "frio";
      let etiqueta = "";

      if (dato) {

        if (dato.categoria === "CALIENTE") {
          clase = "caliente";
          etiqueta = "🔥";

        } else if (dato.categoria === "OBSERVACION") {
          clase = "medio";
          etiqueta = "⚡";

        }

      }

      html += `
        <div class="animal ${clase}">
          <strong>${a.numero}</strong><br>
          ${etiqueta} ${a.animal}
        </div>
      `;

    });

    document.getElementById("animales").innerHTML = html;


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    const calientes =
      datos.top10.filter(
        a => a.categoria === "CALIENTE"
      ).length;

    const observacion =
      datos.top10.filter(
        a => a.categoria === "OBSERVACION"
      ).length;

    const atrasados =
      datos.atrasados
        ? datos.atrasados.length
        : 0;

    document.getElementById("estadistica").innerHTML = `
      <p>📊 Historial: <strong>${datos.historial}</strong> registros</p>
      <p>🔥 Calientes: <strong>${calientes}</strong></p>
      <p>⚡ En observación: <strong>${observacion}</strong></p>
      <p>⏳ Atrasados: <strong>${atrasados}</strong></p>
    `;


  } catch (error) {

    console.error(error);

    document.getElementById("pronostico").innerHTML = `
      <h2>⚠️ Error</h2>
      <p>${error.message}</p>
    `;

  }

}


// ==========================================
// BOTÓN ACTUALIZAR
// ==========================================

document
  .getElementById("actualizar")
  .addEventListener("click", cargarResultados);


// ==========================================
// CARGAR AUTOMÁTICAMENTE
// ==========================================

cargarResultados();
