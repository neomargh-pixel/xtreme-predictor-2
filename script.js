/*
==================================================
XTREME PREDICTOR 2.0
SCRIPT PRINCIPAL
VERSIÓN ESTABLE
==================================================
*/

const emojisAnimales = {
  "DELFÍN":"🐬","BALLENA":"🐋","CARNERO":"🐏","TORO":"🐂",
  "CIEMPIÉS":"🐛","ALACRÁN":"🦂","LEÓN":"🦁","RANA":"🐸",
  "PERICO":"🦜","RATÓN":"🐭","ÁGUILA":"🦅","TIGRE":"🐯",
  "GATO":"🐱","CABALLO":"🐴","MONO":"🐒","PALOMA":"🕊️",
  "ZORRO":"🦊","OSO":"🐻","PAVO":"🦃","BURRO":"🫏",
  "CHIVO":"🐐","COCHINO":"🐷","GALLO":"🐓","CAMELLO":"🐫",
  "CEBRA":"🦓","IGUANA":"🦎","GALLINA":"🐔","VACA":"🐄",
  "PERRO":"🐶","ZAMURO":"🦅","ELEFANTE":"🐘","CAIMÁN":"🐊",
  "LAPA":"🐹","ARDILLA":"🐿️","PESCADO":"🐟","VENADO":"🦌",
  "JIRAFA":"🦒","CULEBRA":"🐍","TORTUGA":"🐢","BÚFALO":"🐃",
  "LECHUZA":"🦉","AVISPA":"🐝","CANGURO":"🦘","TUCÁN":"🦜",
  "MARIPOSA":"🦋","CHIGÜIRE":"🦫","GARZA":"🪿","PUMA":"🐆",
  "PAVO REAL":"🦚","PUERCOESPÍN":"🦔","PEREZA":"🦥",
  "CANARIO":"🐤","PELÍCANO":"🦩","PULPO":"🐙","CARACOL":"🐌",
  "GRILLO":"🦗","OSO HORMIGUERO":"🐜","TIBURÓN":"🦈","PATO":"🦆",
  "HORMIGA":"🐜","PANTERA":"🐈‍⬛","CAMALEÓN":"🦎","PANDA":"🐼",
  "CACHICAMO":"🦔","CANGREJO":"🦀","GAVILÁN":"🦅","ARAÑA":"🕷️",
  "LOBO":"🐺","AVESTRUZ":"🪶","JAGUAR":"🐆","CONEJO":"🐰",
  "BISONTE":"🦬","GUACAMAYA":"🦜","GORILA":"🦍",
  "HIPOPÓTAMO":"🦛","TURPIAL":"🐦","GUÁCHARO":"🦉"
};


/*
==================================================
LOTERÍA
==================================================
*/

let loteriaActual =
  localStorage.getItem("xtremeLoteria") ||
  "guacharoactivo";


const configuracionLoterias = {

  guacharoactivo: {
    nombre: "Guácharo Activo",
    actualizar: "/api/actualizar",
    analizar: "/api/analizar"
  },

  lagranjita: {
    nombre: "La Granjita",
    actualizar: "/api/actualizarGranjita",
    analizar: "/api/analizarGranjita"
  },

  selvaplus: {
    nombre: "Selva Plus",
    actualizar: "/api/actualizarSelvaPlus",
    analizar: "/api/analizarSelvaPlus"
  },

  granamillonaria: {
    nombre: "Granja Millonaria",
    actualizar: "/api/actualizarGranjaMillonaria",
    analizar: "/api/analizarGranjaMillonaria"
  }

};


/*
==================================================
ANIMALES
==================================================
*/

function obtenerListaAnimales(nombre) {

  if (
    nombre === "guacharoactivo" &&
    typeof animalesGuacharo !== "undefined"
  ) {
    return animalesGuacharo;
  }

  if (
    nombre === "lagranjita" &&
    typeof animalesGranjita !== "undefined"
  ) {
    return animalesGranjita;
  }

  if (
    nombre === "selvaplus" &&
    typeof animalesSelvaPlus !== "undefined"
  ) {
    return animalesSelvaPlus;
  }

  if (
    nombre === "granamillonaria" &&
    typeof animalesGranjaMillonaria !== "undefined"
  ) {
    return animalesGranjaMillonaria;
  }

  return [];
}


let animales =
  obtenerListaAnimales(loteriaActual);


/*
==================================================
NORMALIZAR
==================================================
*/

function normalizarTexto(valor) {

  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

}


function normalizarNumero(valor) {

  const texto =
    String(valor ?? "").trim();

  if (!texto) return "";

  const numero = Number(texto);

  if (Number.isNaN(numero)) {
    return texto;
  }

  return String(numero);
}


/*
==================================================
EMOJI
==================================================
*/

function obtenerEmoji(animal) {

  const nombre =
    String(animal ?? "")
      .trim()
      .toUpperCase();

  return (
    emojisAnimales[nombre] ||
    emojisAnimales[normalizarTexto(nombre)] ||
    "🐾"
  );

}


/*
==================================================
CONFIGURACIÓN
==================================================
*/

function obtenerConfiguracionLoteria() {

  return (
    configuracionLoterias[loteriaActual] ||
    configuracionLoterias.guacharoactivo
  );

}


/*
==================================================
ACTUALIZAR LISTA
==================================================
*/

function actualizarListaAnimales() {

  const lista =
    obtenerListaAnimales(loteriaActual);

  if (
    Array.isArray(lista) &&
    lista.length > 0
  ) {
    animales = lista;
  }

}


/*
==================================================
FETCH SEGURO
==================================================
*/

async function fetchSeguro(
  url,
  opciones = {},
  tiempo = 20000
) {

  const controlador =
    new AbortController();

  const temporizador =
    setTimeout(
      () => controlador.abort(),
      tiempo
    );

  try {

    const respuesta =
      await fetch(
        url,
        {
          ...opciones,
          signal: controlador.signal,
          cache: "no-store"
        }
      );

    return respuesta;

  } catch (error) {

    if (error.name === "AbortError") {
      throw new Error(
        "El servidor tardó demasiado en responder."
      );
    }

    throw error;

  } finally {

    clearTimeout(temporizador);

  }

}


/*
==================================================
RESULTADO DE HOY
==================================================
*/

function buscarResultadosAnimal(
  animal,
  resultadosHoy
) {

  const encontrados = [];

  if (
    !resultadosHoy ||
    typeof resultadosHoy !== "object"
  ) {
    return encontrados;
  }

  const nombreBuscado =
    normalizarTexto(animal.animal);

  const numeroBuscado =
    normalizarNumero(animal.numero);


  Object.entries(resultadosHoy).forEach(
    ([nombre, resultados]) => {

      if (!Array.isArray(resultados)) {
        return;
      }

      if (
        normalizarTexto(nombre) ===
        nombreBuscado
      ) {

        encontrados.push(...resultados);

      }

    }
  );


  if (
    encontrados.length === 0 &&
    numeroBuscado
  ) {

    Object.values(resultadosHoy).forEach(
      resultados => {

        if (!Array.isArray(resultados)) {
          return;
        }

        resultados.forEach(resultado => {

          if (
            normalizarNumero(resultado?.numero) ===
            numeroBuscado
          ) {
            encontrados.push(resultado);
          }

        });

      }
    );

  }

  return encontrados;

}


/*
==================================================
BUSCAR RESULTADO INDIVIDUAL
==================================================
*/

function buscarResultadoAnimal(
  animal,
  resultadosHoy
) {

  const resultados =
    buscarResultadosAnimal(
      animal,
      resultadosHoy
    );

  return resultados.length > 0
    ? resultados[0]
    : null;

}


/*
==================================================
MAPA DE PRONÓSTICOS
==================================================
*/

function obtenerMapaPronosticos(
  pronosticos
) {

  const mapa = new Map();

  if (!Array.isArray(pronosticos)) {
    return mapa;
  }

  pronosticos.forEach(animal => {

    mapa.set(
      normalizarTexto(animal.animal),
      animal
    );

    mapa.set(
      `NUMERO:${normalizarNumero(animal.numero)}`,
      animal
    );

  });

  return mapa;

}


/*
==================================================
COMPROBAR ACIERTO
==================================================
*/

function buscarPronosticoParaResultado(
  resultado,
  mapa
) {

  if (!resultado) {
    return null;
  }

  const nombre =
    normalizarTexto(resultado.animal);

  const porNombre =
    mapa.get(nombre);

  if (porNombre) {
    return porNombre;
  }

  const numero =
    normalizarNumero(resultado.numero);

  if (numero) {

    return (
      mapa.get(`NUMERO:${numero}`) ||
      null
    );

  }

  return null;

}


/*
==================================================
RESULTADOS DE HOY
==================================================
*/

function mostrarResultadosHoy(
  resultadosHoy,
  pronosticos
) {

  const contenedor =
    document.getElementById(
      "resultadosHoy"
    );

  if (!contenedor) {
    return;
  }


  const lista = [];


  if (
    resultadosHoy &&
    typeof resultadosHoy === "object"
  ) {

    Object.entries(resultadosHoy).forEach(
      ([animal, resultados]) => {

        if (!Array.isArray(resultados)) {
          return;
        }

        resultados.forEach(resultado => {

          lista.push({

            animal,

            numero:
              resultado?.numero ?? "",

            hora:
              resultado?.hora ?? "",

            fecha:
              resultado?.fecha ?? ""

          });

        });

      }
    );

  }


  lista.sort((a, b) =>
    String(a.fecha)
      .localeCompare(
        String(b.fecha)
      )
  );


  if (lista.length === 0) {

    contenedor.innerHTML = `
      <p>
        ⏳ Todavía no hay resultados de hoy.
      </p>
    `;

    return;

  }


  const mapa =
    obtenerMapaPronosticos(
      pronosticos
    );


  contenedor.innerHTML = `

    <div class="resultados-hoy-lista">

      ${lista.map(
        (resultado, index) => {

          const acierto =
            buscarPronosticoParaResultado(
              resultado,
              mapa
            );


          const nombre =
            String(resultado.animal)
              .trim()
              .toUpperCase();


          return `

            <div
              class="resultado-hoy"
              ${
                acierto
                  ? `
                    style="
                      border-left:4px solid #22c55e;
                      padding-left:8px;
                    "
                  `
                  : ""
              }
            >

              <strong>
                ${index + 1}.
                ${obtenerEmoji(nombre)}
                ${nombre}
              </strong>

              <span>
                #${resultado.numero}
              </span>

              <small>
                🕐 ${resultado.hora || ""}
              </small>

              ${
                acierto
                  ? `
                    <div
                      class="acierto-resultado"
                      style="
                        margin-top:6px;
                        font-weight:900;
                      "
                    >
                      🚀💥🏁
                      ${nombre}
                      ACIERTO XTREME
                      🏁💥🚀
                    </div>
                  `
                  : ""
              }

            </div>

          `;

        }
      ).join("")}

    </div>

  `;

}


/*
==================================================
PRONÓSTICOS
==================================================
*/

function pintarPronosticos(
  datos,
  configuracion
) {

  const contenedor =
    document.getElementById(
      "pronostico"
    );

  if (!contenedor) {
    return;
  }


  const pronosticos =
    Array.isArray(datos.pronosticos)
      ? datos.pronosticos.slice(0, 3)
      : [];


  if (pronosticos.length === 0) {

    contenedor.innerHTML = `

      <div
        style="
          text-align:center;
          padding:25px 10px;
        "
      >

        <h2>
          ⚠️ Sin pronóstico disponible
        </h2>

        <p>
          No hay suficientes datos para generar
          las posibilidades del día.
        </p>

      </div>

    `;

    return;

  }


  contenedor.innerHTML = `

    <div class="pronosticos-dia">

      <h1>
        🎯 POSIBILIDADES DEL DÍA
      </h1>

      <p>
        ${configuracion.nombre}
        — análisis XTREME actualizado.
      </p>

      <div class="lista-pronosticos">

        ${pronosticos.map(
          (animal, index) => {

            const posicion =
              index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : "🥉";


            const resultado =
              buscarResultadoAnimal(
                animal,
                datos.resultadosHoy
              );


            const acierto =
              Boolean(resultado);


            return `

              <div class="pronostico-animal">

                <h2>
                  ${posicion}
                  ${obtenerEmoji(animal.animal)}
                  ${animal.animal}
                </h2>

                ${
                  acierto
                    ? `
                      <div
                        class="acierto-xtreme"
                        style="
                          text-align:center;
                          font-weight:900;
                          margin:10px 0;
                        "
                      >
                        🚀💥🏁
                        ACIERTO XTREME
                        🏁💥🚀
                      </div>

                      <p>
                        🎯 Resultado:
                        <strong>
                          #${resultado.numero}
                          ${resultado.hora
                            ? " · " + resultado.hora
                            : ""}
                        </strong>
                      </p>
                    `
                    : `
                      <div
                        class="estado-pronostico"
                        style="
                          font-weight:700;
                          margin:8px 0 10px;
                        "
                      >
                        🎯 Pronóstico activo
                      </div>
                    `
                }

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
        ).join("")}

      </div>

      <p class="nota-pronostico">
        👀 👉🏼 Son posibilidades estadísticas
        de XTREME.
      </p>

    </div>

  `;

}


/*
==================================================
TOP 10
==================================================
*/

function pintarTop10(datos) {

  const tabla =
    document.getElementById("top10");

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";


  if (!Array.isArray(datos.top10)) {
    return;
  }


  datos.top10.forEach(
    (animal, index) => {

      tabla.innerHTML += `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            <strong>
              ${obtenerEmoji(animal.animal)}
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


/*
==================================================
ATRASADOS
==================================================
*/

function pintarAtrasados(datos) {

  const tabla =
    document.getElementById(
      "atrasados"
    );

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";


  if (
    Array.isArray(datos.atrasados) &&
    datos.atrasados.length > 0
  ) {

    datos.atrasados.forEach(
      (animal, index) => {

        tabla.innerHTML += `

          <tr>

            <td>
              ${index + 1}
            </td>

            <td>
              <strong>
                ${obtenerEmoji(animal.animal)}
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

    tabla.innerHTML = `

      <tr>
        <td colspan="5">
          No hay animales con
          7 o más días de atraso.
        </td>
      </tr>

    `;

  }

}


/*
==================================================
ANIMALITOS
==================================================
*/

function pintarAnimales(datos) {

  const contenedor =
    document.getElementById(
      "animales"
    );

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";


  if (!Array.isArray(animales)) {
    return;
  }


  animales.forEach(animal => {

    const dato =
      Array.isArray(datos.top10)
        ? datos.top10.find(
            x =>
              normalizarTexto(x.animal) ===
              normalizarTexto(animal.animal)
          )
        : null;


    const resultados =
      buscarResultadosAnimal(
        animal,
        datos.resultadosHoy
      );


    let clase = "frio";


    if (dato) {

      if (
        Number(dato.indice) >= 80
      ) {
        clase = "caliente";

      } else if (
        Number(dato.indice) >= 50
      ) {
        clase = "medio";
      }

    }


    let estado = `
      <small>
        ⏳ No salió hoy
      </small>
    `;


    if (resultados.length > 0) {

      estado = `

        <small>

          ✅ Salió hoy

          ${resultados.map(
            resultado => `

              <br>

              🕐
              ${resultado.hora ?? ""}

            `
          ).join("")}

        </small>

      `;

    }


    contenedor.innerHTML += `

      <div class="animal ${clase}">

        <strong>
          ${animal.numero}
        </strong>

        <br>

        ${obtenerEmoji(animal.animal)}

        ${animal.animal}

        <br>

        ${estado}

      </div>

    `;

  });

}


/*
==================================================
ESTADÍSTICAS
==================================================
*/

function pintarEstadisticas(
  datos,
  configuracion
) {

  const contenedor =
    document.getElementById(
      "estadistica"
    );

  if (!contenedor) {
    return;
  }


  const estadisticas =
    datos.estadisticas || {};


  const totalHistorial =
    Number(datos.historial) || 0;


  const totalAnimales =
    Number(
      estadisticas.totalAnimales
    ) ||
    animales.length;


  const totalAtrasados =
    Number(
      estadisticas.totalAtrasados
    ) ||
    0;


  const mayorAtraso =
    estadisticas.mayorAtraso ||
    "N/A";


  const diasMayorAtraso =
    Number(
      estadisticas.diasMayorAtraso
    ) ||
    0;


  const candidatos =
    Number(
      estadisticas.candidatosPronostico
    ) ||
    0;


  const pronosticos =
    Array.isArray(datos.pronosticos)
      ? datos.pronosticos
      : [];


  contenedor.innerHTML = `

    <div class="estadisticas-grid">

      <p>
        🐾 Total de animalitos:
        <strong>
          ${totalAnimales}
        </strong>
      </p>

      <p>
        📚 Historial:
        <strong>
          ${totalHistorial}
        </strong>
      </p>

      <p>
        ⏳ Total atrasados:
        <strong>
          ${totalAtrasados}
        </strong>
      </p>

      <p>
        🚨 Mayor atraso:
        <strong>
          ${mayorAtraso}
        </strong>
      </p>

      <p>
        📅 Días de atraso:
        <strong>
          ${diasMayorAtraso}
        </strong>
      </p>

      <p>
        🎯 Candidatos:
        <strong>
          ${candidatos}
        </strong>
      </p>

      <p>
        🔥 Pronósticos de hoy:
        <strong>
          ${pronosticos.length}
        </strong>
      </p>

      <p>
        🎰 Lotería:
        <strong>
          ${configuracion.nombre}
        </strong>
      </p>

    </div>

  `;

}


/*
==================================================
CARGAR ANÁLISIS
==================================================
*/

async function cargarAnalisis() {

  const configuracion =
    obtenerConfiguracionLoteria();


  const pronostico =
    document.getElementById(
      "pronostico"
    );


  if (pronostico) {

    pronostico.innerHTML = `

      <h1>
        Analizando...
      </h1>

      <p>
        Calculando posibilidades XTREME...
      </p>

    `;

  }


  try {

    const respuesta =
      await fetchSeguro(
        `${configuracion.analizar}?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control":
              "no-cache"
          }
        }
      );


    if (!respuesta.ok) {

      throw new Error(
        `Error del servidor: ${respuesta.status}`
      );

    }


    const datos =
      await respuesta.json();


    if (!datos.ok) {

      throw new Error(
        datos.error ||
        "La API no pudo analizar los resultados."
      );

    }


    actualizarListaAnimales();


    pintarPronosticos(
      datos,
      configuracion
    );


    mostrarResultadosHoy(
      datos.resultadosHoy,
      datos.pronosticos
    );


    pintarTop10(datos);


    pintarAtrasados(datos);


    pintarAnimales(datos);


    pintarEstadisticas(
      datos,
      configuracion
    );


  } catch (error) {

    console.error(
      "ERROR XTREME:",
      error
    );


    if (pronostico) {

      pronostico.innerHTML = `

        <div
          style="
            text-align:center;
            padding:20px;
          "
        >

          <h2>
            ⚠️ ERROR XTREME
          </h2>

          <p>
            ${error.message}
          </p>

          <button
            onclick="cargarAnalisis()"
            style="
              margin-top:10px;
              padding:10px 18px;
              border:0;
              border-radius:8px;
              cursor:pointer;
            "
          >
            🔄 REINTENTAR
          </button>

        </div>

      `;

    }


    const estadistica =
      document.getElementById(
        "estadistica"
      );

    if (estadistica) {

      estadistica.innerHTML = `
        ⚠️ No se pudo cargar el análisis.
      `;

    }

  }

}


/*
==================================================
ACTUALIZAR RESULTADOS
==================================================
*/

async function actualizarTodo() {

  const boton =
    document.getElementById(
      "actualizar"
    );


  if (boton) {

    boton.disabled = true;

    boton.innerText =
      "⏳ ACTUALIZANDO...";

  }


  try {

    const configuracion =
      obtenerConfiguracionLoteria();


    const respuesta =
      await fetchSeguro(
        `${configuracion.actualizar}?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control":
              "no-cache"
          }
        },
        30000
      );


    if (!respuesta.ok) {

      throw new Error(
        `Error al actualizar: ${respuesta.status}`
      );

    }


    const datos =
      await respuesta.json();


    if (!datos.ok) {

      throw new Error(
        datos.error ||
        "No se pudieron actualizar los resultados."
      );

    }


    await cargarAnalisis();


  } catch (error) {

    console.error(
      "ERROR ACTUALIZANDO:",
      error
    );


    alert(
      "⚠️ Error al actualizar:\n\n" +
      error.message
    );

  } finally {

    if (boton) {

      boton.disabled = false;

      boton.innerText =
        "🔄 ACTUALIZAR RESULTADOS";

    }

  }

}


/*
==================================================
SELECTOR DE LOTERÍA
==================================================
*/

const selector =
  document.getElementById(
    "selectorLoteria"
  );


if (selector) {

  selector.value =
    loteriaActual;


  selector.addEventListener(
    "change",
    () => {

      loteriaActual =
        selector.value;


      localStorage.setItem(
        "xtremeLoteria",
        loteriaActual
      );


      animales =
        obtenerListaAnimales(
          loteriaActual
        );


      cargarAnalisis();

    }
  );

}


/*
==================================================
BOTÓN ACTUALIZAR
==================================================
*/

const botonActualizar =
  document.getElementById(
    "actualizar"
  );


if (botonActualizar) {

  botonActualizar.addEventListener(
    "click",
    actualizarTodo
  );

}


/*
==================================================
ARRANQUE XTREME
==================================================
*/

actualizarListaAnimales();

cargarAnalisis();
