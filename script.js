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

let html="";

animales.forEach((animal,i)=>{

html+=`
<div class="animal">
<h3>${i+1}</h3>
<p>${animal}</p>
</div>
`;

});

document.getElementById("animales").innerHTML=html;

let ranking=[];

let hoy=new Date();

animales.forEach(animal=>{

let historial=resultados.filter(r=>r.animal===animal);

historial.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));

let salidas=historial.length;

let dias=30;

if(historial.length>0){

dias=Math.floor(
(hoy-new Date(historial[0].fecha))
/
(1000*60*60*24)
);

}

let indice=0;

indice+=salidas*12;

indice+=dias*2;

if(dias>=5 && dias<=12)
indice+=20;

if(dias==0)
indice-=40;

if(dias==1)
indice-=20;

if(indice<0)
indice=0;

if(indice>100)
indice=100;

let tendencia="🔴 Baja";

if(indice>=90)
tendencia="🔥 Muy Alta";

else if(indice>=75)
tendencia="🟢 Alta";

else if(indice>=60)
tendencia="🟡 Media";

ranking.push({

animal,
salidas,
dias,
indice,
tendencia

});

});

ranking.sort((a,b)=>b.indice-a.indice);

let tabla="";

ranking.slice(0,10).forEach((a,i)=>{

tabla+=`
<tr>
<td>${i+1}</td>
<td>${a.animal}</td>
<td>${a.salidas}</td>
<td>${a.dias}</td>
<td>${a.indice}%</td>
<td>${a.tendencia}</td>
</tr>
`;

});

document.getElementById("top10").innerHTML=tabla;

document.getElementById("pronostico").innerHTML=`
<h2>${ranking[0].animal}</h2>
<p>🔥 Índice XTREME: ${ranking[0].indice}%</p>
<p>${ranking[0].tendencia}</p>
`;

document.getElementById("estadistica").innerHTML=`
<b>Animales:</b> ${animales.length}<br>
<b>Resultados cargados:</b> ${resultados.length}<br>
<b>Líder:</b> ${ranking[0].animal}<br>
<b>Índice:</b> ${ranking[0].indice}%
`;

const boton=document.getElementById("actualizar");

if(boton){

boton.onclick=function(){

location.reload();

};

}

}

cargarResultados();
