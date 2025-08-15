document.addEventListener('DOMContentLoaded', function() {
    const calendarModal = document.getElementById('calendarModal');
    const openCalendarLink = document.getElementById('openCalendarLink');
    const closeCalendarBtn = document.getElementById('closeCalendar');

    // Abrir modal al hacer clic en el enlace
    if (openCalendarLink && calendarModal) {
        openCalendarLink.addEventListener('click', function(e) {
            e.preventDefault(); // Evita scroll automático
            calendarModal.style.display = 'block';
        });
    }

    // Cerrar modal al hacer clic en el botón de cerrar
    if (closeCalendarBtn && calendarModal) {
        closeCalendarBtn.addEventListener('click', function() {
            calendarModal.style.display = 'none';
        });
    }

    // Opcional: cerrar modal al hacer clic fuera del contenido
    calendarModal.addEventListener('click', function(e) {
        if (e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
    });
});
