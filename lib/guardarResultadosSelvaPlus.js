import supabase from "./supabase.js";

export default async function guardarResultadosSelvaPlus(
  resultados
) {

  if (
    !resultados ||
    resultados.length === 0
  ) {
    return;
  }

  const { error } =
    await supabase
      .from("historial_selvaplus")
      .upsert(
        resultados,
        {
          onConflict:
            "animal,numero,fecha",
          ignoreDuplicates:
            true
        }
      );

  if (error) {
    throw error;
  }

  console.log(
    `${resultados.length} resultados de Selva Plus procesados.`
  );

}
