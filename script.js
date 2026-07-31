const animales = [
"🐎 Caballo","🐅 Tigre","🦁 León","🐊 Caimán","🐍 Serpiente",
"🐒 Mono","🐓 Gallo","🦅 Águila","🐘 Elefante","🐂 Toro",
"🐕 Perro","🐈 Gato","🐖 Cerdo","🐄 Vaca","🐐 Cabra",
"🦌 Venado","🐇 Conejo","🦆 Pato","🦉 Búho","🦜 Loro",
"🐢 Tortuga","🐬 Delfín","🦈 Tiburón","🐳 Ballena",
"🦀 Cangrejo","🦂 Escorpión","🕷 Araña","🐝 Abeja",
"🦋 Mariposa","🐞 Mariquita","🐿 Ardilla","🦝 Mapache",
"🦓 Cebra","🦍 Gorila","🦏 Rinoceronte","🦛 Hipopótamo",
"🐪 Camello","🦒 Jirafa"
];

async function cargarResultados(){

    const respuesta = await fetch("resultados.json");
    const resultados = await respuesta.json();

    let html = "";

    animales.forEach((animal,i)=>{

        html += `
        <div class="animal">
            <h3>${i+1}</h3>
            <p>${animal}</p>
        </div>`;
    });

    document.getElementById("animales").innerHTML = html;

    let ranking = [];

    animales.forEach(animal=>{

        let historial = resultados.filter(r=>r.animal===animal);

        ranking.push({
            animal,
            salidas: historial.length
        });

    });

    ranking.sort((a,b)=>b.salidas-a.salidas);

    let tabla="";

    ranking.slice(0,10).forEach((a,i)=>{

        tabla += `
        <tr>
            <td>${i+1}</td>
            <td>${a.animal}</td>
            <td>${a.salidas}</td>
        </tr>`;

    });

    document.getElementById("top10").innerHTML = tabla;

    document.getElementById("pronostico").innerHTML = `
        <h2>${ranking[0].animal}</h2>
        <p>Más apariciones registradas</p>
    `;

    document.getElementById("estadistica").innerHTML = `
        Animales: ${animales.length}<br>
        Registros: ${resultados.length}
    `;
}

cargarResultados();
