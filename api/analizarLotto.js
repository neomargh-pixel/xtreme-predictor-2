import supabase from "../lib/supabase.js";

const TZ = "America/Caracas";

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function obtenerFechaVenezuela() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());
}

function obtenerFechaDeResultado(fecha) {
  if (!fecha) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date(fecha));
}

function diferenciaDias(fechaA, fechaB) {
  const a =
    new Date(
      `${fechaA}T12:00:00-04:00`
    );

  const b =
    new Date(
      `${fechaB}T12:00:00-04:00`
    );

  return Math.max(
    0,
    Math.floor(
      (
        b.getTime() -
        a.getTime()
      ) / 86400000
    )
  );
}

function indiceXTREME(
  salidas,
  diasSinSalir
) {
  const frecuencia =
    Math.min(
      100,
      salidas * 3
    );

  const atraso =
    Math.min(
      40,
      diasSinSalir * 4
    );

  return Math.min(
    100,
    Math.round(
      frecuencia +
      atraso
    )
  );
}

function tendencia(indice) {
  if (indice >= 90) {
    return "MUY ALTA";
  }

  if (indice >= 75) {
    return "ALTA";
  }

  if (indice >= 50) {
    return "MEDIA";
  }

  if (indice >= 25) {
    return "BAJA";
  }

  return "MUY BAJA";
}

function categoria(
  indice,
  diasSinSalir
) {
  if (
    diasSinSalir >= 7
  ) {
    return "ATRASADO";
  }

  if (
    indice >= 80
  ) {
    return "CALIENTE";
  }

  if (
    indice >= 50
  ) {
    return "MEDIO";
  }

  return "FRÍO";
}

function ordenarPorIndice(lista) {
  return lista.sort(
    (a, b) => {
      if (
        Number(b.indice) !==
        Number(a.indice)
      ) {
        return (
          Number(b.indice) -
          Number(a.indice)
        );
      }

      return (
        Number(b.salidas) -
        Number(a.salidas)
      );
    }
  );
}

export default async function handler(
  req,
  res
) {
  try {
    const {
      data,
      error
    } =
      await supabase
        .from(
          "historial_lotto"
        )
        .select(
          "animal,numero,fecha"
        )
        .order(
          "fecha",
          {
            ascending: true
          }
        );

    if (error) {
      throw error;
    }

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return res.status(200).json({
        ok: true,
        loteria:
          "Lotto Activo",
        historial: 0,
        pronosticos: [],
        top10: [],
        atrasados: [],
        resultadosHoy: {},
        estadisticas: {
          totalAnimales: 38,
          totalAtrasados: 0,
          mayorAtraso: "N/A",
          diasMayorAtraso: 0,
          candidatosPronostico: 0
        }
      });
    }

    const hoy =
      obtenerFechaVenezuela();

    const mapa =
      new Map();

    data.forEach(
      resultado => {
        const nombre =
          normalizarTexto(
            resultado.animal
          );

        if (!mapa.has(nombre)) {
          mapa.set(
            nombre,
            {
              animal:
                nombre,
              numero:
                resultado.numero,
              fechas: [],
              salidas: 0
            }
          );
        }

        const registro =
          mapa.get(nombre);

        registro.salidas++;

        const fecha =
          obtenerFechaDeResultado(
            resultado.fecha
          );

        if (fecha) {
          registro.fechas.push(
            fecha
          );
        }
      }
    );

    const animales =
      Array.from(
        mapa.values()
      ).map(
        registro => {
          const fechas =
            Array.from(
              new Set(
                registro.fechas
              )
            ).sort();

          const ultimaFecha =
            fechas.length > 0
              ? fechas[
                  fechas.length - 1
                ]
              : null;

          const diasSinSalir =
            ultimaFecha
              ? diferenciaDias(
                  ultimaFecha,
                  hoy
                )
              : 999;

          const salidas7 =
            data.filter(
              resultado => {
                const fecha =
                  obtenerFechaDeResultado(
                    resultado.fecha
                  );

                return (
                  normalizarTexto(
                    resultado.animal
                  ) ===
                  registro.animal &&
                  fecha &&
                  diferenciaDias(
                    fecha,
                    hoy
                  ) <= 7
                );
              }
            ).length;

          const salidas14 =
            data.filter(
              resultado => {
                const fecha =
                  obtenerFechaDeResultado(
                    resultado.fecha
                  );

                return (
                  normalizarTexto(
                    resultado.animal
                  ) ===
                  registro.animal &&
                  fecha &&
                  diferenciaDias(
                    fecha,
                    hoy
                  ) <= 14
                );
              }
            ).length;

          const salidas30 =
            data.filter(
              resultado => {
                const fecha =
                  obtenerFechaDeResultado(
                    resultado.fecha
                  );

                return (
                  normalizarTexto(
                    resultado.animal
                  ) ===
                  registro.animal &&
                  fecha &&
                  diferenciaDias(
                    fecha,
                    hoy
                  ) <= 30
                );
              }
            ).length;

          const indice =
            indiceXTREME(
              registro.salidas,
              diasSinSalir
            );

          return {
            animal:
              registro.animal,
            numero:
              registro.numero,
            salidas:
              registro.salidas,
            salidas7,
            salidas14,
            salidas30,
            diasSinSalir,
            indice,
            porcentaje:
              indice,
            tendencia:
              tendencia(indice),
            categoria:
              categoria(
                indice,
                diasSinSalir
              ),
            ultimaFecha
          };
        }
      );

    ordenarPorIndice(
      animales
    );

    const top10 =
      animales.slice(
        0,
        10
      );

    const atrasados =
      animales
        .filter(
          animal =>
            Number(
              animal.diasSinSalir
            ) >= 7
        )
        .sort(
          (a, b) =>
            Number(
              b.diasSinSalir
            ) -
            Number(
              a.diasSinSalir
            )
        );

    const candidatos =
      animales.filter(
        animal =>
          Number(
            animal.indice
          ) >= 50
      );

    const pronosticos =
      candidatos.slice(
        0,
        3
      );

    const resultadosHoy = {};

    data.forEach(
      resultado => {
        const fecha =
          obtenerFechaDeResultado(
            resultado.fecha
          );

        if (
          fecha !== hoy
        ) {
          return;
        }

        const nombre =
          normalizarTexto(
            resultado.animal
          );

        if (
          !resultadosHoy[nombre]
        ) {
          resultadosHoy[nombre] =
            [];
        }

        resultadosHoy[nombre]
          .push({
            numero:
              resultado.numero,
            fecha:
              resultado.fecha,
            hora:
              new Intl.DateTimeFormat(
                "es-VE",
                {
                  timeZone: TZ,
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                }
              ).format(
                new Date(
                  resultado.fecha
                )
              )
          });
      }
    );

    const mayorAtraso =
      atrasados.length > 0
        ? atrasados[0].animal
        : "N/A";

    const diasMayorAtraso =
      atrasados.length > 0
        ? atrasados[0].diasSinSalir
        : 0;

    res.status(200).json({
      ok: true,
      loteria:
        "Lotto Activo",
      historial:
        data.length,
      fechaActual:
        hoy,
      pronosticos,
      top10,
      atrasados,
      resultadosHoy,
      estadisticas: {
        totalAnimales:
          38,
        totalAtrasados:
          atrasados.length,
        mayorAtraso,
        diasMayorAtraso,
        candidatosPronostico:
          candidatos.length
      }
    });

  } catch (error) {
    console.error(
      "ERROR ANALIZANDO LOTTO:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error.message ||
        "Error analizando Lotto Activo."
    });
  }
}
