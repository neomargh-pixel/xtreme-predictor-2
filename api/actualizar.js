export default async function handler(req, res) {

  try {

    const respuesta = await fetch(
      "https://www.loteriadehoy.com/animalitos/resultados/"
    );

    const html = await respuesta.text();

    return res.status(200).json({
      ok: true,
      caracteres: html.length,
      muestra: html.substring(0, 3000)
    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}
