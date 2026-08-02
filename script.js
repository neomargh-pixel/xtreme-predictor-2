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
    let fechaActual = new Date();

    resultados.forEach(r => {

      const nombre = r.animal;

      if (!ranking[nombre]) {
        ranking[nombre] = {
          animal: nombre,
          salidas: 0,
          ultimaSalida: r.fecha ? new Date(r.fecha) : null,
          recientes: 0
        };
      }

      ranking[nombre].salidas++;

      if (r.fecha) {
        let fecha = new Date(r.fecha);

        if (!ranking[nombre].ultimaSalida || fecha > ranking[nombre].ultimaSalida) {
          ranking[nombre].ultimaSalida = fecha;
        }

        let dias30 = (fechaActual - fecha) / (1000 * 60 * 60 * 24);

        if (dias30 <= 30) {
          ranking[nombre].recientes++;
        }
      }
    });


    let lista = Object.values(ranking);


    lista.forEach(a => {

      if (a.ultimaSalida) {
        a.dias = Math.floor(
          (fechaActual - a.ultimaSalida) /
          (1000 * 60 * 60 * 24)
        );
      } else {
        a.dias = 0;
      }


      a.indice = Math.min(
        100,
        (a.salidas * 5) +
        (a.dias * 3) +
        (a.recientes * 4)
      );

    });


    lista.sort((a,b)=> b.indice - a.indice);


    document.getElementById("pronostico").innerHTML = `
      <h1>🔥 ${lista[0].animal}</h1>
      <p>Confianza XTREME: ${lista[0].indice}%</p>
      <p>Días sin salir: ${lista[0].dias}</p>
    `;


    let tabla = "";

    lista.slice(0,10).forEach((a,i)=>{

      tabla += `
      <tr>
        <td>${i+1}</td>
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
      Animales analizados: ${lista.length}
    `;


  } catch(e){

    document.getElementById("estadistica").innerHTML =
      "Error cargando resultados.";

    console.error(e);
  }
}


document.getElementById("actualizar").onclick = cargarResultados;

cargarResultados();
