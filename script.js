async function cargarResultados() {

  try {

    const respuesta = await fetch("/api/analizar");
    const datos = await respuesta.json();

    if (!datos.ok) {
      console.error(datos.error);
      return;
    }

    // ==========================================
    // PRONÓSTICO XTREME
    // ==========================================

    if (datos.pronostico) {

      const p = datos.pronostico;

      document.getElementById("pronostico").innerHTML = `
        <h1>🔥 ${p.animal}</h1>
        <p>Índice XTREME: ${Math.min(p.indice, 100)}%</p>
        <p>Tendencia: <strong>${p.tendencia}</strong></p>
        <p>Salidas: ${p.salidas}</p>
        <p>Días sin salir: ${p.diasSinSalir}</p>
        <p>Categoría: 🔥 ${p.categoria}</p>
      `;

    }

    // ==========================================
    // TOP 10
    // ==========================================

    document.getElementById("top10").innerHTML =
      datos.top10.map((a, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${a.animal}</td>
          <td>${a.salidas}</td>
          <td>${a.diasSinSalir}</td>
          <td>${Math.min(a.indice, 100)}%</td>
        </tr>
      `).join("");

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

        } else if (dato.categoria === "ATRASADO") {

          clase = "atrasado";
          etiqueta = "⏳";

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

    console.error(
      "Error cargando resultados:",
      error
    );

  }

}

// ==========================================
// BOTÓN ACTUALIZAR
// ==========================================

document.getElementById("actualizar").onclick =
  cargarResultados;

// ==========================================
// CARGAR AL ABRIR
// ==========================================

cargarResultados();
