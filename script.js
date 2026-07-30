document.getElementById("pronostico").innerHTML = `
<div style="padding:20px;text-align:center;">
<h2>🔥 Pronóstico del Día</h2>
<h1>🐎 CABALLO</h1>
<p>Confianza del algoritmo: <b>92%</b></p>
</div>
`;

const animales = [
"🐎 Caballo",
"🐓 Gallo",
"🦁 León",
"🐅 Tigre",
"🐕 Perro",
"🦅 Águila",
"🐴 Burro",
"🐘 Elefante",
"🐊 Cocodrilo",
"🦋 Mariposa",
"🦃 Pavo",
"🐄 Vaca"
];

let html = "";

animales.forEach((animal,i)=>{

html += `
<div style="
display:inline-block;
width:120px;
margin:8px;
padding:12px;
text-align:center;
background:#12251b;
border:1px solid #19ff67;
border-radius:12px;
">
<h3>${i+1}</h3>
<p>${animal}</p>
</div>
`;

});

document.getElementById("animales").innerHTML = html;

let tabla="";

for(let i=1;i<=10;i++){

tabla += `
<tr>
<td>${i}</td>
<td>${animales[i-1]}</td>
<td>${1200-i*50}</td>
<td>⬆</td>
<td>${95-i}%</td>
</tr>
`;

}

document.getElementById("top10").innerHTML=tabla;
