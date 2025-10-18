document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const openLink = document.getElementById('openCalendarLink');
    const modal = document.getElementById('calendarModal');
    const closeBtn = document.getElementById('closeCalendar');
    const calendarForm = document.getElementById('calendarForm');
    const calDate = document.getElementById('cal-date');
    const calHour = document.getElementById('cal-hour');

    if (!openLink || !modal || !calendarForm || !calDate || !calHour) return;

    // Cargar bloqueos desde blocked-dates.js (si no existe, usar vacío)
    const BLOCKS = window.DG_BLOCKED_DATES || { dates: [], ranges: [] };

    // Formatear fecha YYYY-MM-DD
    function toISODate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    // Comprueba si una fecha ISO está bloqueada (fecha puntual o dentro de rango)
    function isBlockedIso(iso) {
        if (!iso) return false;
        if (BLOCKS.dates && BLOCKS.dates.includes(iso)) return true;
        if (BLOCKS.ranges && Array.isArray(BLOCKS.ranges)) {
            const [y, m, d] = iso.split('-').map(Number);
            const target = new Date(y, m - 1, d).setHours(0,0,0,0);
            for (const r of BLOCKS.ranges) {
                const [fy, fm, fd] = r.from.split('-').map(Number);
                const [ty, tm, td] = r.to.split('-').map(Number);
                const from = new Date(fy, fm - 1, fd).setHours(0,0,0,0);
                const to = new Date(ty, tm - 1, td).setHours(0,0,0,0);
                if (target >= from && target <= to) return true;
            }
        }
        return false;
    }

    // Día de semana: 0 Domingo ... 6 Sábado
    function isSundayDateObj(d) { return d.getDay() === 0; }

    // Avanzar al próximo día disponible (evita domingos y días bloqueados)
    function nextAvailableDate(date) {
        const d = new Date(date.getTime());
        // evitar bucle infinito: limitar búsqueda a 365 días
        for (let i = 0; i < 365; i++) {
            const iso = toISODate(d);
            if (!isSundayDateObj(d) && !isBlockedIso(iso)) return d;
            d.setDate(d.getDate() + 1);
        }
        // si no hay fecha disponible en 1 año, devolver la original
        return date;
    }

    // Generar slots horarios (hora inicio en formato "HH:MM")
    // Reglas: Lun-Vie 09:00 - 19:00 (último slot 18:00), Sáb 09:00 - 14:00 (último slot 13:00), Dom ninguno
    function generateSlotsForDate(date) {
        const dow = date.getDay(); // 0-6
        if (dow === 0) return []; // domingo
        let start = 9;
        let end = 19; // exclusive
        if (dow === 6) { // sábado
            end = 14;
        }
        const slots = [];
        for (let h = start; h < end; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
        }
        return slots;
    }

    // Cargar reservas desde localStorage
    function loadBookings() {
        try {
            return JSON.parse(localStorage.getItem('dg_bookings') || '[]');
        } catch {
            return [];
        }
    }
    function saveBookings(b) {
        localStorage.setItem('dg_bookings', JSON.stringify(b));
    }

    // Rellenar select de horas según la fecha seleccionada, deshabilitar slots pasados y slots ya reservados
    function populateHourOptionsFor(dateIso) {
        // limpiar opciones
        calHour.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Selecciona horario';
        calHour.appendChild(placeholder);

        if (!dateIso) return;

        // bloquear si día feriado/vacaciones
        if (isBlockedIso(dateIso)) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Día no disponible (feriado / vacaciones)';
            opt.disabled = true;
            calHour.appendChild(opt);
            return;
        }

        const [y, m, d] = dateIso.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const today = new Date();
        const isToday = toISODate(dateObj) === toISODate(today);

        const bookings = loadBookings();
        const bookedForDay = bookings.filter(b => b.fecha === dateIso).map(b => b.hora);

        const slots = generateSlotsForDate(dateObj);
        if (slots.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No hay horarios disponibles (domingo)';
            opt.disabled = true;
            calHour.appendChild(opt);
            return;
        }

        slots.forEach(slot => {
            const opt = document.createElement('option');
            opt.value = slot;
            opt.textContent = `${slot} - ${String(Number(slot.split(':')[0]) + 1).padStart(2, '0')}:00`;
            // marcar si ya reservado
            if (bookedForDay.includes(slot)) {
                opt.disabled = true;
                opt.textContent += ' — Reservado';
            } else if (isToday) {
                // deshabilitar si ya pasado o empieza en menos de 30 min
                const [hh, mm] = slot.split(':').map(Number);
                const slotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hh, mm);
                if (slotDate.getTime() <= (Date.now() + 30 * 60 * 1000)) {
                    opt.disabled = true;
                    opt.textContent += ' — No disponible';
                }
            }
            calHour.appendChild(opt);
        });
    }

    // Establecer fecha mínima (hoy)
    const today = new Date();
    calDate.min = toISODate(today);
    // si hoy es domingo o feriado, seleccionar siguiente día disponible
    const initialDate = (isSundayDateObj(today) || isBlockedIso(toISODate(today))) ? nextAvailableDate(today) : today;
    calDate.value = toISODate(initialDate);

    // Abrir modal
    openLink.addEventListener('click', function (e) {
        e.preventDefault();
        // si la fecha actual seleccionada es domingo o feriado, mover al siguiente disponible
        const sel = new Date(calDate.value + 'T00:00:00');
        if (isSundayDateObj(sel) || isBlockedIso(toISODate(sel))) {
            const nd = nextAvailableDate(sel);
            calDate.value = toISODate(nd);
        }
        populateHourOptionsFor(calDate.value);
        modal.style.display = 'block';
        // Foco en el nombre
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    });

    // Cerrar modal
    closeBtn.addEventListener('click', closeModal);
    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
    });
    // Cerrar al clicar fuera del cuadro
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.style.display = 'none';
    }

    // Al cambiar la fecha, validar domingo/feriado y regenerar horas
    calDate.addEventListener('change', function () {
        const selIso = calDate.value;
        if (!selIso) return;
        const [y, m, d] = selIso.split('-').map(Number);
        const selDate = new Date(y, m - 1, d);
        if (isSundayDateObj(selDate)) {
            const nd = nextAvailableDate(selDate);
            calDate.value = toISODate(nd);
            alert('No doy asesorías los domingos. He seleccionado el siguiente día disponible.');
            populateHourOptionsFor(calDate.value);
            return;
        }
        if (isBlockedIso(selIso)) {
            const nd = nextAvailableDate(selDate);
            calDate.value = toISODate(nd);
            alert('La fecha seleccionada está bloqueada por feriado o vacaciones. He seleccionado el siguiente día disponible.');
            populateHourOptionsFor(calDate.value);
            return;
        }
        populateHourOptionsFor(calDate.value);
    });

    // Envío del formulario con validaciones adicionales (día/hora dentro de rango y sin conflicto)
    calendarForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = (document.getElementById('cal-name') || {}).value || '';
        const email = (document.getElementById('cal-email') || {}).value || '';
        const fecha = calDate.value;
        const hora = calHour.value;
        const servicioInput = calendarForm.querySelector('input[name="servicio"]');
        const servicio = servicioInput ? servicioInput.value : 'Asesoría Legal';

        if (!nombre || !email || !fecha || !hora) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // validar que la fecha no sea domingo o bloqueada (protección extra)
        const [y, m, d] = fecha.split('-').map(Number);
        const selDate = new Date(y, m - 1, d);
        if (isSundayDateObj(selDate) || isBlockedIso(fecha)) {
            alert('La fecha seleccionada no está disponible. Elige otra fecha.');
            return;
        }

        // validar que la hora esté dentro de los slots permitidos para esa fecha
        const allowed = generateSlotsForDate(selDate);
        if (!allowed.includes(hora)) {
            alert('Horario no válido para la fecha seleccionada. Por favor elige otro horario.');
            populateHourOptionsFor(fecha);
            return;
        }

        // verificar conflicto: misma fecha y misma hora
        const bookings = loadBookings();
        const conflict = bookings.find(b => b.fecha === fecha && b.hora === hora);
        if (conflict) {
            alert('Lo siento, ese horario ya está reservado. Por favor elige otro horario o fecha.');
            populateHourOptionsFor(fecha);
            return;
        }

        const booking = {
            id: Date.now(),
            nombre,
            email,
            fecha,
            hora,
            servicio
        };

        bookings.push(booking);
        saveBookings(bookings);

        // Simular envío (aquí podrías llamar a una API real)
        console.log('Nueva reserva:', booking);

        alert('Reserva recibida. Te enviaré un correo de confirmación pronto.');
        calendarForm.reset();
        // volver a establecer min y fecha por si reseteó
        calDate.min = toISODate(new Date());
        const newToday = new Date();
        calDate.value = isSundayDateObj(newToday) || isBlockedIso(toISODate(newToday)) ? toISODate(nextAvailableDate(newToday)) : toISODate(newToday);
        populateHourOptionsFor(calDate.value);
        closeModal();
    });

    // Inicializar opciones de horas para la fecha por defecto
    populateHourOptionsFor(calDate.value);
});