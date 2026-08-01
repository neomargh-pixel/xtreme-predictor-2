export default async function handler(req, res) {

try {

const respuesta = await fetch("https://www.tuazar.com/loteria/animalitos/resultados/");

const html = await respuesta.text();

res.status(200).json({
ok:true,
tamano: html.length
});

} catch(error){

res.status(500).json({
ok:false,
error:error.message
});

}

}
