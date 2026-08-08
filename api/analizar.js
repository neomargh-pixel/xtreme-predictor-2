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

    // TOP 10 DE TENDENCIA
    const top10 = analisis
      .slice()
      .sort((a, b) => b.indice - a.indice)
      .slice(0, 10);

    // ANIMALES MÁS ATRASADOS
    const atrasados = analisis
      .slice()
      .sort((a, b) => {

        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        return b.salidas - a.salidas;

      })
      .slice(0, 10);

    return res.status(200).json({

      ok: true,

      historial: historial.length,

      pronostico: top10[0] || null,

      top10: top10,

      atrasados: atrasados

    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}
