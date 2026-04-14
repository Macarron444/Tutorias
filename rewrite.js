const fs = require('fs');
const fn = 'c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/PanelTutor.jsx';
let c = fs.readFileSync(fn, 'utf-8');

c = c.replace(
  /const \[user, setUser\] = useState\(null\);[\s\n]*const \[reservas, setReservas\] = useState\(\[\]\);/g,
  "const [user, setUser] = useState(null);\n  const [reservas, setReservas] = useState([]);\n  const [bloquesLibres, setBloquesLibres] = useState([]);"
);

c = c.replace(
  /const combinedData = \[\.\.\.\(Array\.isArray\(proximas\)\? proximas : \[\]\), \.\.\.\(Array\.isArray\(pendientes\)\? pendientes : \[\]\)\];/g,
  "const combinedData = [...(Array.isArray(proximas)? proximas : []), ...(Array.isArray(pendientes)? pendientes : [])];\n\n        try {\n          const tb = await apiClient.get('/api/bloques/tutor/' + correoTutor);\n          if(tb.data && !!tb.data.length){\n             const libres = tb.data.filter(b => b.estado === 'LIBRE' || b.estado === 'DISPONIBLE').map(b => {\n                 let dInicio = typeof b.fecha_inicio === 'string' ? new Date(b.fecha_inicio) : parseUtcDate(b.horaInicio);\n                 let dFin = typeof b.fecha_fin === 'string' ? new Date(b.fecha_fin) : parseUtcDate(b.horaFin);\n                 return {\n                    id: 'b_'+(b.bloque_id || b.id),\n                    isLibre: true,\n                    materiaNombre: b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría',\n                    title: 'Libre - ' + (b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría'),\n                    start: dInicio,\n                    end: dFin,\n                    horario: dInicio.toLocaleTimeString([],{hour:'2-digits',minute:'2-digit'}) + ' - ' + dFin.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})\n                 };\n             });\n             setBloquesLibres(libres);\n          }\n        } catch(e) { console.error('Error fetching free tb', e); }"
);

c = c.replace(
   /\{reservasActivas\.length === 0 \? \(/g,
   "{reservasActivas.length === 0 && viewMode === 'list' ? ("
);

// We replace the Calendar properties
const calendarReplacement = "<Calendar\n"+
"                localizer={localizer}\n"+
"                events={[...reservasActivas, ...bloquesLibres]}\n"+
"                startAccessor=\"start\"\n"+
"                endAccessor=\"end\"\n"+
"                style={{ height: '100%' }}\n"+
"                min={new Date(0, 0, 0, 7, 0, 0)}\n"+
"                max={new Date(0, 0, 0, 18, 0, 0)}\n"+
"                date={calendarDate}\n"+
"                onNavigate={(newDate) => setCalendarDate(newDate)}\n"+
"                defaultView=\"week\"\n"+
"                eventPropGetter={(event) => {\n"+
"                  if (event.isLibre) return { className: 'free-event', style: { backgroundColor: '#28a745', borderColor: '#1e7e34', color: '#fff', fontSize:'0.9rem', cursor:'pointer' } };\n"+
"                  if (event.isRemoving) return { className: 'removing-event' };\n"+
"                  return { className: 'active-event' };\n"+
"                }}\n"+
"                onSelectEvent={(event) => {\n"+
"                  if(event.isLibre) {\n"+
"                     Swal.fire({ title: 'Hora Disponible', html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Los estudiantes podrán encontrar en el catálogo esta clase.', icon: 'success' });\n"+
"                     return;\n"+
"                  }\n"+
"                  Swal.fire({\n"+
"                    title: 'Clase con ' + event.estudianteNombre,\n"+
"                    html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Califícala en la vista de tarjetas.</p>',\n"+
"                    icon: 'info'\n"+
"                  });\n"+
"                }}\n"+
"                messages={{";

c = c.replace(/<Calendar[\s\S]*?messages=\{\{/g, calendarReplacement);

fs.writeFileSync(fn, c, 'utf-8');
console.log('Done replacement');
