const animales = [
"🐎 Caballo","🐅 Tigre","🦁 León","🐊 Caimán","🐍 Serpiente",
"🐒 Mono","🐓 Gallo","🦅 Águila","🐘 Elefante","🐂 Toro",
"🐕 Perro","🐈 Gato","🐖 Cerdo","🐄 Vaca","🐐 Cabra",
"🦌 Venado","🐇 Conejo","🦆 Pato","🦉 Búho","🦜 Loro",
"🐢 Tortuga","🐬 Delfín","🦈 Tiburón","🐳 Ballena","🦀 Cangrejo",
"🦂 Escorpión","🕷 Araña","🐝 Abeja","🦋 Mariposa","🐞 Mariquita",
"🐿 Ardilla","🦝 Mapache","🦓 Cebra","🦍 Gorila","🦏 Rinoceronte",
"🦛 Hipopótamo","🐪 Camello","🦒 Jirafa"
];

const historial = {};

animales.forEach(a=>{

historial[a]={
salidas:0,
dias:Math.floor(Math.random()*30)+1
};

});

historial["🐅 Tigre"].salidas=8;
historial["🐅 Tigre"].dias=6;

historial["🐎 Caballo"].salidas=7;
historial["🐎 Caballo"].dias=2;

historial["🦁 León"].salidas=5;
historial["🦁 León"].dias=10;

function calcularIndice(a){

let h=historial[a];

let indice=0;

indice+=h.salidas*8;

indice+=h.dias*2;

if(h.dias>=5 && h.dias<=12)
indice+=20;

if(h.dias<=1)
indice-=25;

if(indice>100)
indice=100;

if(indice<0)
indice=0;

return indice;

}

let lista=[];

animales.forEach(a=>{

lista.push({

animal:a,
salidas:historial[a].salidas,
dias:historial[a].dias,
indice:calcularIndice(a)

});

});

lista.sort((a,b)=>b.indice-a.indice);

document.getElementById("pronostico").innerHTML=`
<h1>${lista[0].animal}</h1>
<p>Confianza ${lista[0].indice}%</p>
`;

let html="";

animales.forEach((a,i)=>{

html+=`
<div class="animal">
<h3>${i+1}</h3>
<p>${a}</p>
</div>
`;

});

document.getElementById("animales").innerHTML=html;

let tabla="";

lista.slice(0,10).forEach((a,i)=>{

tabla+=`
<tr>
<td>${i+1}</td>
<td>${a.animal}</td>
<td>${a.salidas}</td>
<td>${a.dias}</td>
<td>${a.indice}%</td>
</tr>
`;

});

document.getElementById("top10").innerHTML=tabla;

document.getElementById("estadistica").innerHTML=`
<b>Animales:</b> ${animales.length}<br>
<b>Analizados:</b> ${lista.length}<br>
<b>Motor:</b> XTREME CORE 2.0
`;

document.getElementById("actualizar").onclick=function(){

location.reload();

};
