import * as cheerio from "cheerio";

export default async function handler(req, res) {

try {

const respuesta = await fetch("https://www.tuazar.com/loteria/animalitos/resultados/");
const html = await respuesta.text();

const $ = cheerio.load(html);

let resultados = [];

$(".resultado, .result, .item").each((i, el) => {

resultados.push({
texto: $(el).text().trim()
});

});

res.status(200).json(resultados);

} catch(error){

res.status(500).json({
ok:false,
error:error.message
});

}

}
