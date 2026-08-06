import * as cheerio from "cheerio";

const animalesValidos = [
"BALLENA","DELFÍN","CARNERO","TORO","CIEMPIÉS","ALACRÁN","LEÓN","RANA","PERICO","RATÓN",
"ÁGUILA","TIGRE","GATO","CABALLO","MONO","PALOMA","ZORRILLO","OSO","PAVO","BURRO",
"CHIVO","COCHINO","GALLO","CAMELLO","CEBRA","IGUANA","GALLINA","VACA","PERRO","ZAMURO",
"ELEFANTE","CAIMÁN","LAPA","ARDILLA","PESCADO","VENADO","JIRAFA","CULEBRA","TORTUGA","BÚFALO",
"LECHUZA","AVISPA","CANGURO","TUCÁN","MARIPOSA","CHIGÜIRE","GARZA","PUMA","PAVO REAL","PUERCOESPÍN",
"PEREZA","CANARIO","PELICANO","PULPO","CARACOL","GRILLO","ORNITORRINCO","TIBURÓN","PATO","LANGOSTA",
"PANTERA","CAMALEÓN","PANDA","CACHICAMO","CANGREJO","GAVILÁN","ARAÑA","LOBO","AVESTRUZ","JAGUAR",
"CONEJO","BISONTE","GUACAMAYA","GORILA","HIPOPÓTAMO","TURPIAL","GUÁCHARO"
];

export default async function handler(req, res) {
  try {
    const respuesta = await fetch("https://www.tuazar.com/loteria/animalitos/resultados/");
    const html = await respuesta.text();

    const $ = cheerio.load(html);
    const texto = $.text().toUpperCase();

    const regex = /(\d+)\s*-\s*([A-ZÁÉÍÓÚÑ ]+)/g;

    const resultados = [];
    let m;

    while ((m = regex.exec(texto)) !== null) {
      const numero = parseInt(m[1]);
      const animal = m[2].trim();

      if (animalesValidos.includes(animal)) {
        resultados.push({ numero, animal });
      }
    }

    return res.status(200).json({
      ok: true,
      encontrados: resultados.length,
      primeros: resultados.slice(0, 10)
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
