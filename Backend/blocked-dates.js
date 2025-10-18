// Lista de feriados y periodos de vacaciones. Formato YYYY-MM-DD.
window.DG_BLOCKED_DATES = {
    // fechas puntuales
    dates: [
        "2026-01-01", // Año Nuevo
        "2025-12-25",  // Navidad
        "2025-11-17" // Día de la Revolucion
    ],
    // rangos inclusivos: bloquea todos los días entre from y to
    ranges: [
        { from: "2025-12-24", to: "2025-12-31" }
    ]
};