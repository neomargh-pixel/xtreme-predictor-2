async function cargarResultados() {

  try {

    const respuesta = await fetch(
      "/api/analizar?_=" + Date.now(),
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error HTTP: ${respuesta.status}`
      );
    }

    const datos =
      await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.error ||
        "Error en el análisis"
      );
    }


    // ==========================================
    // 3 PRONÓSTICOS
    // ==========================================

    const pronosticos =
      Array.isArray(datos.pronosticos)
        ? datos.pronosticos.slice(0, 3)
        : [];


    const contenedorPronostico =
      document.getElementById(
        "pronostico"
      );


    if (
      pronosticos.length > 0
    ) {

      contenedorPronostico.innerHTML = `

        <div class="pronosticos-dia">

          <h1>
            🎯 POSIBILIDADES DEL DÍA
          </h1>

          <p>
            Estos son los 3 animalitos que el análisis
            XTREME considera con mejores posibilidades
            según el historial.
          </p>

          <div class="lista-pronosticos">

            ${
              pronosticos.map(
                (animal, index) => {

                  const posicion =
                    index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : "🥉";

                  return `

                    <div class="pronostico-animal">

                      <h2>
                        ${posicion}
                        ${animal.animal}
                      </h2>

                      <p>
                        🔥 Confianza XTREME:
                        <strong>
                          ${animal.porcentaje ?? 0}%
                        </strong>
                      </p>

                      <p>
                        📊 Salidas:
                        <strong>
                          ${animal.salidas ?? 0}
                        </strong>
                      </p>

                      <p>
                        ⏳ Días sin salir:
                        <strong>
                          ${animal.diasSinSalir ?? 0}
                        </strong>
                      </p>

                      <p>
                        📈 Tendencia:
                        <strong>
                          ${animal.tendencia ?? "N/A"}
                        </strong>
                      </p>

                      <p>
                        🏷️ Categoría:
                        <strong>
                          ${animal.categoria ?? "N/A"}
                        </strong>
                      </p>

                    </div>

                  `;

                }
              ).join("")
            }

          </div>

          <p class="nota-pronostico">
            👀 👉🏼 Son posibilidades estadísticas de XTREME proyecto.
          </p>

        </div>

      `;

    } else {

      contenedorPronostico.innerHTML = `

        <h2>
          ⚠️ Sin pronóstico disponible
        </h2>

        <p>
          No hay suficientes datos para generar
          las posibilidades del día.
        </p>

      `;

    }


    // ==========================================
    // TOP 10
    // ==========================================

    const tablaTop =
      document.getElementById(
        "top10"
      );

    tablaTop.innerHTML = "";


    if (
      Array.isArray(datos.top10)
    ) {

      datos.top10.forEach(
        (animal, index) => {

          tablaTop.innerHTML += `

            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                <strong>
                  ${animal.animal}
                </strong>
              </td>

              <td>
                ${animal.salidas ?? 0}
              </td>

              <td>
                ${animal.diasSinSalir ?? 0}
              </td>

              <td>
                ${animal.indice ?? 0}%
              </td>

            </tr>

          `;

        }
      );

    }


    // ==========================================
    // ANIMALES ATRASADOS
    // ==========================================

    const tablaAtrasados =
      document.getElementById(
        "atrasados"
      );

    tablaAtrasados.innerHTML = "";


    if (
      Array.isArray(datos.atrasados) &&
      datos.atrasados.length > 0
    ) {

      datos.atrasados.forEach(
        (animal, index) => {

          tablaAtrasados.innerHTML += `

            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                <strong>
                  ${animal.animal}
                </strong>
              </td>

              <td>
                ${animal.salidas ?? 0}
              </td>

              <td>
                ${animal.diasSinSalir ?? 0}
              </td>

              <td>
                ${animal.indice ?? 0}%
              </td>

            </tr>

          `;

        }
      );

    } else {

      tablaAtrasados.innerHTML = `

        <tr>

          <td colspan="5">
            No hay animales con 7 o más días de atraso.
          </td>

        </tr>

      `;

    }


    // ==========================================
    // ANIMALITOS
    // ==========================================

    const contenedorAnimales =
      document.getElementById(
        "animales"
      );

    contenedorAnimales.innerHTML = "";


    if (
      Array.isArray(animales)
    ) {

      animales.forEach(
        a => {

          const dato =
            Array.isArray(datos.top10)
              ? datos.top10.find(
                  x =>
                    String(x.animal)
                      .trim()
                      .toUpperCase() ===
                    String(a.animal)
                      .trim()
                      .toUpperCase()
                )
              : null;


          let clase = "frio";


          if (dato) {

            if (
              Number(dato.indice) >= 80
            ) {

             
