async function cargarResultados() {

  try {

    const respuesta = await fetch("/api/analizar");
    const datos = await respuesta.json();

    if (!datos.ok) {
      document.getElementById("estadistica").innerHTML = "Error analizando.";
      return;
    }

    const pronostico = datos.pronostico;
    const top10 = datos.top10;

    document.getElementById("pronostico").innerHTML = `
      <h1>🔥 ${pronostico.animal}</h1>
      <p>Índice XTREME: ${pronostico.indice}%</p>
      <p>Salidas: ${pronostico.salidas}</p>
      <p>Días sin salir: ${pronostico.diasSinSalir}</p>
    `;

    let tabla = "";

    top10.forEach((a,i)=>{

      tabla += `
      <tr>
        <td>${i+1}</td>
        <td>${a.animal}</td>
        <td>${a.salidas}</td>
        <td>${a.diasSinSalir}</td>
        <td>${a.indice}%</td>
      </tr>
      `;

    });

    document.getElementById("top10").innerHTML = tabla;

    let html = "";

    animales.forEach(a=>{

      const dato = top10.find(x=>x.animal===a.animal);

      let clase = "frio";

      if(dato){
        if(dato.indice>=50){
          clase="caliente";
        }else if(dato.indice>=30){
          clase="medio";
        }
      }

      html += `
      <div class="animal ${clase}">
        <strong>${a.numero}</strong><br>
        ${a.animal}
      </div>
      `;

    });

    document.getElementById("animales").innerHTML = html;

    document.getElementById("estadistica").innerHTML =
      `Historial almacenado: ${datos.historial}<br>Top 10 generado correctamente.`;

  } catch(e){

    document.getElementById("estadistica").innerHTML="Error cargando datos.";

  }

}

document.getElementById("actualizar").onclick=cargarResultados;

cargarResultados();
