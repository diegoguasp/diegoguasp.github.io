document.addEventListener('DOMContentLoaded', function() {
    const calendarModal = document.getElementById('calendarModal');
    const openCalendarBtn = document.getElementById('openCalendarBtn');
    const closeCalendarBtn = document.getElementById('closeCalendar');

    if (openCalendarBtn && calendarModal) {
        openCalendarBtn.addEventListener('click', function() {
            calendarModal.style.display = 'block';
        });
    }
    if (closeCalendarBtn && calendarModal) {
        closeCalendarBtn.addEventListener('click', function() {
            calendarModal.style.display = 'none';
        });
    }
    calendarModal.addEventListener('click', function(e) {
        if (e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
    });
});
