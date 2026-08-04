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
    console.error("Error guardando historial:", error.message);
  } else {
    console.log(`${resultados.length} resultados guardados.`);
  }

}
