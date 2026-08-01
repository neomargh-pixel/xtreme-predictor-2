const axios = require("axios");

export default async function handler(req, res) {

try {

const pagina = await axios.get("https://www.tuazar.com/loteria/animalitos/resultados/");

res.status(200).json({
ok:true,
mensaje:"Conexión realizada correctamente.",
tamano: pagina.data.length
});

} catch(error){

res.status(500).json({
ok:false,
error:error.message
});

}

}
