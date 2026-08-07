import supabase from "./supabase.js";

export default async function guardarResultados(resultados) {

  if (!resultados || resultados.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("historial")
    .insert(resultados);

  if (error) {
    throw error;
  }

  console.log(`${resultados.length} resultados guardados.`);
}
