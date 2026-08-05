import supabase from "../lib/supabase.js";

export default async function handler(req, res) {

  try {

    const { data, error } = await supabase
      .from("historial")
      .select("*")
      .limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        paso: "Supabase",
        error: error.message
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: "Conexión con Supabase correcta.",
      filas: data.length
    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      paso: "Catch",
      error: error.message
    });

  }

}
