const fs = require('fs');
const path = 'c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/PanelTutor.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the timezone issue by using parseUtcDate properly for both
content = content.replace(
    /let dInicio = typeof b\.fecha_inicio === 'string' \? new Date\(b\.fecha_inicio\) : parseUtcDate\(b\.horaInicio\);/g,
    'let dInicio = parseUtcDate(b.fecha_inicio || b.horaInicio);'
);
content = content.replace(
    /let dFin = typeof b\.fecha_fin === 'string' \? new Date\(b\.fecha_fin\) : parseUtcDate\(b\.horaFin\);/g,
    'let dFin = parseUtcDate(b.fecha_fin || b.horaFin);'
);

// Add calendarView state to fix view navigation buttons
content = content.replace(
    /const \[calendarDate, setCalendarDate\] = useState\(new Date\(\)\);/g,
    'const [calendarDate, setCalendarDate] = useState(new Date());\n  const [calendarView, setCalendarView] = useState("week");'
);

// Add view and onView to the Calendar component
content = content.replace(
    /defaultView="week"/g,
    'view={calendarView}\n                onView={(v) => setCalendarView(v)}'
);

fs.writeFileSync(path, content, 'utf8');
