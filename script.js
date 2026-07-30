const animales = [
"🐎 Caballo",
"🐅 Tigre",
"🦁 León",
"🐊 Caimán",
"🐍 Serpiente",
"🐒 Mono",
"🐓 Gallo",
"🦅 Águila",
"🐘 Elefante",
"🐂 Toro",
"🐕 Perro",
"🐈 Gato",
"🐖 Cerdo",
"🐄 Vaca",
"🐐 Cabra",
"🦌 Venado",
"🐇 Conejo",
"🦆 Pato",
"🦉 Búho",
"🦜 Loro",
"🐢 Tortuga",
"🐬 Delfín",
"🦈 Tiburón",
"🐳 Ballena",
"🦀 Cangrejo",
"🦂 Escorpión",
"🕷 Araña",
"🐝 Abeja",
"🦋 Mariposa",
"🐞 Mariquita",
"🐿 Ardilla",
"🦝 Mapache",
"🦓 Cebra",
"🦍 Gorila",
"🦏 Rinoceronte",
"🦛 Hipopótamo",
"🐪 Camello",
"🦒 Jirafa"
];

let html = "";

animales.forEach((animal,i)=>{

html += `
<div class="animal">
<h3>${i+1}</h3>
<p>${animal}</p>
</div>
`;

});

document.getElementById("animales").innerHTML = html;

let tabla = "";

for(let i=0;i<10;i++){

let salidas = Math.floor(Math.random()*15)+1;
let dias = Math.floor(Math.random()*30)+1;
let indice = Math.floor(Math.random()*25)+75;

tabla += `
<tr>
<td>${i+1}</td>
<td>${animales[i]}</td>
<td>${salidas}</td>
<td>${dias}</td>
<td>${indice}%</td>
</tr>
`;

}

document.getElementById("top10").innerHTML = tabla;

document.getElementById("estadistica").innerHTML = `
<b>Animales analizados:</b> ${animales.length}<br>
<b>Sorteos:</b> 250<br>
<b>Algoritmo:</b> XTREME CORE 2.0
`;

document.getElementById("actualizar").onclick = function(){

alert("Actualización simulada correctamente.");

};
