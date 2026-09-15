import supabase from "./supabase.js";

export default async function guardarResultadosRuleta(resultados) {

  if (!resultados || resultados.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("historial_ruleta")
    .upsert(resultados, {
      onConflict: "animal,numero,fecha",
      ignoreDuplicates: true
    });

  if (error) {
    throw error;
  }

  console.log(
    `${resultados.length} resultados de Ruleta Activa procesados.`
  );

}
