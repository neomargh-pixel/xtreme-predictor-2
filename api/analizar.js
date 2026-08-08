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

    const top10 = analisis
      .slice()
      .sort((a, b) => b.indice - a.indice)
      .slice(0, 10);

    const atrasados = analisis
      .slice()
      .sort((a, b) => {
        if (b.diasSinSalir !== a.diasSinSalir) {
          return b.diasSinSalir - a.diasSinSalir;
        }

        return b.salidas - a.salidas;
      })
      .slice(0, 10);

    // DIAGNÓSTICO DE FECHAS
    const fechas = historial
      .map(r => r.fecha)
      .filter(Boolean)
      .sort();

    const fechaMasAntigua = fechas[0] || null;
    const fechaMasReciente = fechas[fechas.length - 1] || null;

    const fechasUnicas = [
      ...new Set(
        historial
          .map(r => r.fecha ? String(r.fecha).substring(0, 10) : null)
          .filter(Boolean)
      )
    ].sort();

    return res.status(200).json({

      ok: true,

      historial: historial.length,

      DIAGNOSTICO: {
        fechaMasAntigua,
        fechaMasReciente,
        cantidadFechasDiferentes: fechasUnicas.length,
        primeras5Fechas: fechasUnicas.slice(0, 5),
        ultimas5Fechas: fechasUnicas.slice(-5)
      },

      pronostico: top10[0] || null,

      top10,

      atrasados

    });

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

}
