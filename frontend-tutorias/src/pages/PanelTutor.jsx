import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Swal from 'sweetalert2';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Dashboard.css';
import 'moment/locale/es';

moment.locale('es');
const localizer = momentLocalizer(moment);

const parseUtcDate = (fechaStr) => {
  const d = new Date(fechaStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
};

export default function PanelTutor() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [bloquesLibres, setBloquesLibres] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("week");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiClient.get('/auth/me');
        if (userRes.data.rol !== 'TUTOR') {
          navigate('/dashboard');
          return;
        }
        setUser(userRes.data);

        let materiasDict = {};
        try {
          const matRes = await apiClient.get('/api/materias/');
          matRes.data.forEach(m => materiasDict[m.id] = m.nombre);
        } catch(e) { console.error('No se pudo cargar el catálogo', e); }

        const correoTutor = userRes.data.correo;
        
        let proximas = [];
        try {
          const proxRes = await apiClient.get('/api/reservas/tutor/' + correoTutor + '/proximas');
          proximas = proxRes.data.content || proxRes.data.data || proxRes.data || [];
        } catch(e) { console.warn("No hay próximas o falló", e); }

        let pendientes = [];
        try {
          const pendRes = await apiClient.get('/api/reservas/tutor/' + correoTutor + '/pendientes-asistencia');
          pendientes = pendRes.data.content || pendRes.data.data || pendRes.data || [];
        } catch(e) { console.warn("No hay pendientes o no soporta endpoint."); }

        const combinedData = [...(Array.isArray(proximas)? proximas : []), ...(Array.isArray(pendientes)? pendientes : [])];
        
        try {
          const tb = await apiClient.get('/api/bloques/tutor/' + correoTutor);
          if (tb.data && !!tb.data.length) {
             const libres = tb.data.filter(b => b.estado === 'LIBRE' || b.estado === 'DISPONIBLE').map(b => {
                 let dInicio = parseUtcDate(b.fecha_inicio || b.horaInicio);
                 let dFin = parseUtcDate(b.fecha_fin || b.horaFin);
                 let startD = new Date(dInicio.getFullYear(), dInicio.getMonth(), dInicio.getDate(), dInicio.getHours(), dInicio.getMinutes());
                 let endD = new Date(dFin.getFullYear(), dFin.getMonth(), dFin.getDate(), dFin.getHours(), dFin.getMinutes());
                 return {
                    id: 'b_' + (b.bloque_id || b.id),
                    isLibre: true,
                    materiaNombre: b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría',
                    title: 'Libre - ' + (b.materia_nombre || (typeof materiasDict !== 'undefined' ? materiasDict[b.materiaId] : 'Tutoría') || 'Tutoría'),
                    start: startD,
                    end: endD,
                    horario: startD.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + ' - ' + endD.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                 };
             });
             setBloquesLibres(libres);
          }
        } catch(e) { console.error('Error fetching free bloques', e); }

        const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());

        if (uniqueData && uniqueData.length > 0) {
          const reservasDetalladas = await Promise.all(uniqueData.map(async r => {
            let estudianteNombre = r.estudianteId;
            try {
               const estRes = await apiClient.get('/api/usuarios/' + r.estudianteId + '/nombre');
               estudianteNombre = estRes.data.nombre;
            } catch(e) {}

            let horario = 'Horario no definido';
            let start = new Date();
            let end = new Date();

            try {
              const bloqueRes = await apiClient.get('/api/bloques/' + r.bloqueDisponibilidadId + '/disponible');
              if (bloqueRes.data) {
                const dateInicio = parseUtcDate(bloqueRes.data.horaInicio);
                const dateFin = parseUtcDate(bloqueRes.data.horaFin);
                
                if (r.fechaSesion) {
                  const parts = r.fechaSesion.split('-');
                  start = new Date(parts[0], parts[1] - 1, parts[2], dateInicio.getHours(), dateInicio.getMinutes());
                  end = new Date(parts[0], parts[1] - 1, parts[2], dateFin.getHours(), dateFin.getMinutes());
                } else {
                  start = dateInicio;
                  end = dateFin;
                }
                const hInicio = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const hFin = end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                horario = hInicio + ' - ' + hFin;
              }
            } catch(e) {}

            return {
              ...r,
              materiaNombre: materiasDict[r.materiaId] || 'Clase #' + r.materiaId,
              estudianteNombre,
              horario,
              start,
              end,
              title: (materiasDict[r.materiaId] || 'Tutoría') + ' - ' + estudianteNombre
            };
          }));
          
          setReservas(reservasDetalladas.sort((a,b) => a.start - b.start));
        }
      } catch (err) {
        console.error('Error', err);
        setErrorMsg('Error cargando tu panel.');
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMarcarAsistencia = async (reservaId, statusText) => {
    const isCompleted = statusText === "COMPLETADA";
    const confirm = await Swal.fire({
      title: isCompleted ? '¿Marcar como Completada?' : '¿Reportar Inasistencia?',
      text: isCompleted ? 'Confirmas que diste esta tutoría correctamente.' : 'Reportarás que el estudiante NO se presentó a tiempo.',
      icon: isCompleted ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Volver',
      confirmButtonColor: isCompleted ? '#2b801a' : '#e41e3f'
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiClient.patch('/api/reservas/'+reservaId+'/asistencia?tutorId='+user.correo, { estado: statusText });
      
      setReservas(prev => prev.map(r => r.id === reservaId ? { ...r, isRemoving: true } : r));
      
      setTimeout(() => {
        setReservas(prev => prev.map(r => r.id === reservaId ? { ...r, estado: statusText, isRemoving: false } : r));
      }, 500);

      Swal.fire('Registrado', 'Se guardó como ' + statusText, 'success');
    } catch(err) {
      Swal.fire('Error', 'No se pudo actualizar: ' + err.message, 'error');
    }
  };

  const reservasActivas = reservas.filter(r => r.estado === 'ACTIVA');

  return (
    <div className='dashboard-container'>
      <nav className='navbar'>
         <div className='navbar-brand'>🎓 Panel del Tutor</div>
         <div className='navbar-links'>
          {user && (
            <div className='user-profile'>
              <div className='user-info'>
                <span className='user-name'>{user.nombre}</span>
                <span className='user-details'>Profesional Universitario</span>
              </div>
              <div style={{width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#fff', color: '#1877f2', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
                T
              </div>
            </div>
          )}
          <button onClick={handleLogout} className='btn-logout'>Cerrar Sesión</button>
         </div>
      </nav>

      <div className='content-wrapper'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <h1 className='page-title'>Mi Agenda de Clases</h1>
          <button 
            className='btn-primary'
            style={{width: 'auto', margin: 0, padding: '10px 20px'}}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            Modo: {viewMode === 'list' ? 'Calendario 📅' : 'Tarjetas 📝'}
          </button>
        </div>

        {reservasActivas.length === 0 && viewMode === 'list' ? (
          <p style={{fontSize: '1.2rem', color: '#666', textAlign: 'center', padding: '50px 0'}}>
            🎉 No tienes clases pendientes o activas asignadas.
          </p>
        ) : viewMode === 'list' ? (
           <div className='cards-grid'>
            {reservasActivas.map(r => (
              <div key={r.id} className={'card ' + (r.isRemoving ? 'removing-card' : '')} style={{borderLeft: '5px solid #166fe5'}}>
                <div>
                  <span className='card-badge' style={{backgroundColor: '#e0e7ff', color: '#0f172a'}}>ID Reserva: #{r.id}</span>
                  <h3 className='card-title'>{r.materiaNombre}</h3>
                  <p className='card-text'><strong>Estudiante:</strong> {r.estudianteNombre}</p>
                  <p className='card-text'><strong>Fecha:</strong> {r.fechaSesion}</p>
                  <p className='card-text'><strong>Horario:</strong> {r.horario}</p>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button 
                    className='btn-primary' 
                    style={{backgroundColor: '#2b801a', backgroundImage: 'none', boxShadow: '0 4px 10px rgba(43, 128, 26, 0.2)', marginTop: 0}}
                    onClick={() => handleMarcarAsistencia(r.id, 'COMPLETADA')}
                  >
                    Tutoría Dada ✔️
                  </button>
                  <button 
                    className='btn-danger' 
                    style={{marginTop: 0}}
                    onClick={() => handleMarcarAsistencia(r.id, 'INASISTENCIA')}
                  >
                    Falta ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{height: '600px', backgroundColor: 'rgba(255,255,255,0.85)', padding: '20px', borderRadius: '16px', boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.7), 0 8px 32px rgba(31,38,135,0.05)'}}>
             <Calendar
                localizer={localizer}
                events={[...reservasActivas, ...bloquesLibres]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                min={new Date(0, 0, 0, 7, 0, 0)}
                max={new Date(0, 0, 0, 18, 0, 0)}
                date={calendarDate}
                onNavigate={(newDate) => setCalendarDate(newDate)}
                view={calendarView}
                onView={(v) => setCalendarView(v)}
                eventPropGetter={(event) => {
                  if (event.isLibre) return { className: 'free-event', style: { backgroundColor: '#28a745', borderColor: '#1e7e34', color: '#fff', fontSize:'0.9rem', cursor:'pointer' } };
                  if (event.isRemoving) return { className: 'removing-event' };
                  return { className: 'active-event' };
                }}
                onSelectEvent={(event) => {
                  if(event.isLibre) {
                     Swal.fire({ title: 'Hora Disponible', html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Los estudiantes podrán agendar tutorías en esta franja.</p>', icon: 'success' });
                     return;
                  }
                  Swal.fire({
                    title: 'Clase con ' + event.estudianteNombre,
                    html: '<p><strong>Materia:</strong> '+event.materiaNombre+'</p><p><strong>Horario:</strong> '+event.horario+'</p><p>Para calificar esta sesión interactúa desde el "Modo Tarjetas".</p>',
                    icon: 'info'
                  });
                }}
                messages={{
                  currentDate: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  today: 'Hoy',
                  previous: 'Atrás',
                  next: 'Siguiente'
                }}
              />
          </div>
        )}
      </div>
    </div>
  );
}
