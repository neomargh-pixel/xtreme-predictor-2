export default async function handler(req, res) {

  res.status(200).json({
    ok: true,
    mensaje: "La función de Vercel está funcionando."
  });

}
