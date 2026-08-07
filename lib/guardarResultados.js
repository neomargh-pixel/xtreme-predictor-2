import supabase from "./supabase.js";

export default async function guardarResultados(resultados) {

  if (!resultados || resultados.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("historial")
    .upsert(resultados, {
      onConflict: "animal,numero,fecha",
      ignoreDuplicates: true
    });

  if (error) {
    throw error;
  }

  console.log(`${resultados.length} resultados procesados.`);
}
