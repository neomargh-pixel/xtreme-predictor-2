import supabase from "./supabase.js";

export default async function guardarResultadosGranjita(resultados) {

  if (!resultados || resultados.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("historial_granjita")
    .upsert(resultados, {
      onConflict: "animal,numero,fecha",
      ignoreDuplicates: true
    });

  if (error) {
    throw error;
  }

  console.log(
    `${resultados.length} resultados de La Granjita procesados.`
  );

}
