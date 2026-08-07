import supabase from "../lib/supabase.js";
import analizarResultados from "../lib/analizarResultados.js";

export default async function handler(req, res) {

  try {

    const { data: historial, error } = await supabase
      .from("historial")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) throw error;

    const analisis = analizarResultados(historial);

    return res.status(200).json({
      ok: true,
      historial: historial.length,
      pronostico: analisis[0],
      top10: analisis.slice(0,10)
    });

  } catch (error) {

    return res.status(500).json({
      ok:false,
      error:error.message
    });

  }

}
