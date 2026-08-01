import * as cheerio from "cheerio";

const animalesValidos = [
"BALLENA","DELFÍN","TORO","CIEMPIÉS","ALACRÁN","LEÓN","RANA","PERICO","RATÓN","ÁGUILA",
"TIGRE","GATO","CABALLO","MONO","PALOMA","ZORRO","OSO","PAVO","BURRO","CABRA",
"GALLO","IGUANA","CEBRA","GALLINA","VACA","COCHINO","ZAMURO","ELEFANTE","CAIMÁN","ARDILLA",
"PESCADO","VENADO","JIRAFA","CULEBRA","TORTUGA","BÚHO","TUCÁN","GARZA","JAGUAR","CONEJO",
"AVESTRUZ","CUERVO"
];

export default async function handler(req, res) {

try {

const respuesta = await fetch("https://www.tuazar.com/loteria/animalitos/resultados/");
const html = await respuesta.text();

const $ = cheerio.load(html);

const texto = $.text().toUpperCase();

const regex = /(\d+)\s*-\s*([A-ZÁÉÍÓÚÑ]+)/g;

let resultados = [];

let m;

while ((m = regex.exec(texto)) !== null) {

const numero = parseInt(m[1]);
const animal = m[2];

if (animalesValidos.includes(animal)) {

resultados.push({
numero,
animal
});

}

}

res.status(200).json(resultados);

} catch (error) {

res.status(500).json({
ok:false,
error:error.message
});

}

}
