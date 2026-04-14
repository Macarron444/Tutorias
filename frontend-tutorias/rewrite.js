const fs = require('fs');
const fn = 'c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/PanelTutor.jsx';
let c = fs.readFileSync(fn, 'utf-8');

c = c.replace(
  /const \[user, setUser\] = useState\(null\);\s*const \[reservas, setReservas\] = useState\(\[\]\);/g,
  \const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [bloquesLibres, setBloquesLibres] = useState([]);\
);

c = c.replace(
  /const combinedData = \[\.\.\.\(Array\.isArray\(proximas\)\? proximas : \[\]\), \.\.\.\(Array\.isArray\(pendientes\)\? pendientes : \[\]\)\];/g,
  \const combinedData = [...(Array.isArray(proximas)? proximas : []), ...(Array.isArray(pendientes)? pendientes : [])];
        
        try {
          const tb = await apiClient.get('/api/bloques/tutor/' + correoTutor);
          if(tb.data && !!tb.data.length){
             const libres = tb.data.filter(b => b.estado === 'LIBRE' || b.estado === 'DISPONIBLE').map(b => {
                 let dInicio = typeof b.fecha_inicio === 'string' ? new Date(b.fecha_inicio) : parseUtcDate(b.horaInicio);
                 let dFin = typeof b.fecha_fin === 'string' ? new Date(b.fecha_fin) : parseUtcDate(b.horaFin);
                 let startD = new Date(dInicio.getUTCFullYear(), dInicio.getUTCMonth(), dInicio.getUTCDate(), dInicio.getUTCHours(), dInicio.getUTCMinutes());
                 let endD = new Date(dFin.getUTCFullYear(), dFin.getUTCMonth(), dFin.getUTCDate(), dFin.getUTCHours(), dFin.getUTCMinutes());
                 return {
                    id: 'b_'+(b.bloque_id || b.id),
                    isLibre: true,
                    materiaNombre: b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría',
                    title: 'Hora Disponible - ' + (b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría'),
                    start: startD,
                    end: endD,
                    horario: startD.toLocaleTimeString([],{hour:'2-digits',minute:'2-digit'}) + ' - ' + endD.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
                 };
             });
             setBloquesLibres(libres);
          }
        } catch(e) { console.error('Error fetching free tb', e); }\
);

c = c.replace(
   /\{reservasActivas\.length === 0 \? \(/g,
   \{reservasActivas.length === 0 && viewMode === 'list' ? (\
);

const calendarReplacement = \<Calendar
              localizer={localizer}
              events={[...reservasActivas, ...bloquesLibres]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              min={new Date(0, 0, 0, 7, 0, 0)}
              max={new Date(0, 0, 0, 18, 0, 0)}
              date={calendarDate}
              onNavigate={(newDate) => setCalendarDate(newDate)}
              defaultView="week"
              eventPropGetter={(event) => {
                if (event.isLibre) return { className: 'free-event', style: { backgroundColor: '#28a745', borderColor: '#1e7e34', color: '#fff', fontSize:'0.9rem', cursor:'pointer' } };
                if (event.isRemoving) return { className: 'removing-event' };
                return { className: 'active-event' };
              }}
              onSelectEvent={(event) => {
                if(event.isLibre) {
                   Swal.fire({ title: 'Hora Disponible', html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Los estudiantes podrán encontrar en el catálogo esta clase.</p>', icon: 'success' });
                   return;
                }
                Swal.fire({
                  title: 'Clase con ' + event.estudianteNombre,
                  html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Califícala en la vista de tarjetas.</p>',
                  icon: 'info'
                });
              }}
              messages={{\;

c = c.replace(/<Calendar[\s\S]*?messages=\{\{/g, calendarReplacement);
fs.writeFileSync(fn, c, 'utf-8');
console.log('Replacement finished!');
