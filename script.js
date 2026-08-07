async function cargarResultados() {

  const respuesta = await fetch("/api/analizar");
  const datos = await respuesta.json();

  if (!datos.ok) return;

  document.getElementById("pronostico").innerHTML = `
    <h1>🔥 ${datos.pronostico.animal}</h1>
    <p>Índice XTREME: ${Math.min(datos.pronostico.indice,100)}%</p>
    <p>Salidas: ${datos.pronostico.salidas}</p>
    <p>Días sin salir: ${datos.pronostico.diasSinSalir}</p>
  `;

  document.getElementById("top10").innerHTML =
    datos.top10.map((a,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${a.animal}</td>
        <td>${a.salidas}</td>
        <td>${a.diasSinSalir}</td>
        <td>${Math.min(a.indice,100)}%</td>
      </tr>
    `).join("");

  let html = "";

  animales.forEach(a=>{

    const dato = datos.top10.find(x=>x.animal===a.animal);

    let clase="frio";

    if(dato){
      if(dato.indice>=50) clase="caliente";
      else if(dato.indice>=30) clase="medio";
    }

    html+=`
      <div class="animal ${clase}">
        <strong>${a.numero}</strong><br>
        ${a.animal}
      </div>
    `;
  });

  document.getElementById("animales").innerHTML=html;

  document.getElementById("estadistica").innerHTML=
    `Historial: ${datos.historial} registros`;
}

document.getElementById("actualizar").onclick=cargarResultados;

cargarResultados();
