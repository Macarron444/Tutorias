import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Swal from 'sweetalert2';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Dashboard.css';

// Configurar el calendario en español
import 'moment/locale/es';
moment.locale('es');
const localizer = momentLocalizer(moment);

const parseUtcDate = (fechaStr) => {
  const d = new Date(fechaStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
};

export default function Reservas() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtros y vistas
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'calendar'
  const [filterMateria, setFilterMateria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  
  // Estado del calendario
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiClient.get('/auth/me');
        setUser(userRes.data);

        // Traer catálogo de materias para mapear nombres
        let materiasDict = {};
        try {
          const matRes = await apiClient.get('/api/materias/');
          matRes.data.forEach(m => materiasDict[m.id] = m.nombre);
        } catch(e) { console.error('No se pudo cargar el catálogo', e); }
        
        const resResponse = await apiClient.get('/api/reservas/estudiante/' + userRes.data.correo + '/proximas');
        const data = resResponse.data.content || resResponse.data.data || resResponse.data;
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Obtener los nombres reales de los tutores y los horarios exactos
          const reservasDetalladas = await Promise.all(data.map(async r => {
            let tutorNombre = r.tutorId;
            try {
              const tutorRes = await apiClient.get('/api/usuarios/' + r.tutorId + '/nombre');
              tutorNombre = tutorRes.data.nombre;
            } catch(e) {}

            let horario = 'Horario por definir';
            let start = new Date();
            let end = new Date();

            try {
              const bloqueRes = await apiClient.get('/api/bloques/' + r.bloqueDisponibilidadId + '/disponible');
              if (bloqueRes.data) {
                const dateInicio = parseUtcDate(bloqueRes.data.horaInicio);
                const dateFin = parseUtcDate(bloqueRes.data.horaFin);
                
                // Extraer hora y minutos de dateInicio y dateFin original
                const startHour = dateInicio.getHours();
                const startMin = dateInicio.getMinutes();
                const endHour = dateFin.getHours();
                const endMin = dateFin.getMinutes();

                // Construir la fecha REAL en el calendario según la fecha que apartó (r.fechaSesion)
                if (r.fechaSesion) {
                  // asume q fechaSesion es 'YYYY-MM-DD'
                  const [yr, mo, da] = r.fechaSesion.split('-');
                  start = new Date(yr, mo - 1, da, startHour, startMin);
                  end = new Date(yr, mo - 1, da, endHour, endMin);
                } else {
                  start = dateInicio;
                  end = dateFin;
                }

                const hInicio = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const hFin = end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                horario = `${hInicio} - ${hFin}`;
              }
            } catch(e) {}
            
            return {
              ...r,
              materiaNombre: materiasDict[r.materiaId] || `Materia #${r.materiaId}`,
              tutorNombre,
              horario,
              start,
              end,
              title: `${materiasDict[r.materiaId] || 'Tutoría'} con ${tutorNombre}`
            };
          }));
          setReservas(reservasDetalladas);
        } else {
          setReservas([]);
        }
      } catch (err) {
        console.error('Error cargando la vista', err);
        setErrorMsg('Error cargando reservas o perfil.');
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCancelar = async (reservaId) => {
    const confirmacion = await Swal.fire({
      title: `¿Cancelar tutoría #${reservaId}?`,
      text: "El horario volverá a estar libre para otros.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    });

    if(!confirmacion.isConfirmed) return;
    
    try {
      await apiClient.patch(`/api/reservas/${reservaId}/cancelar?estudianteId=${user.correo}`);
      
      // Animación de desaparición
      setReservas(prevReservas => prevReservas.map(r => 
        r.id === reservaId ? { ...r, isRemoving: true } : r
      ));

      setTimeout(() => {
        setReservas(prevReservas => prevReservas.map(r => 
          r.id === reservaId ? { ...r, estado: 'CANCELADA', isRemoving: false } : r
        ));
      }, 500);

      Swal.fire(
        'Cancelada',
        'Tu tutoría fue cancelada exitosamente.',
        'success'
      );
    } catch(err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cancelar: ' + (err.response?.data?.mensaje || err.message), 'error');
    }
  };

  const normalizeString = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const filteredReservas = reservas.filter(r => {
    if (filterMateria && !normalizeString(r.materiaNombre).includes(normalizeString(filterMateria))) return false;
    if (filterEstado && r.estado !== filterEstado) return false;
    return true;
  });

  return (
    <div className='dashboard-container'>
      <nav className='navbar'>
        <div className='navbar-brand'>🎓 Mis Tutorías</div>
        <div className='navbar-links'>
          {user && (
            <div className='user-profile'>
              <div className='user-info'>
                <span className='user-name'>{user.nombre}</span>
                <span className='user-details'>{user.rol} | {user.carrera} - Semestre {user.semestre}</span>
              </div>
              <div style={{width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#fff', color: '#1877f2', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
                {user.correo.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <Link to='/catalogo' className='nav-link'>Ver Catálogo</Link>
          <button onClick={handleLogout} className='btn-logout'>Cerrar Sesión</button>
        </div>
      </nav>
      
      <div className='content-wrapper'>
        <h1 className='page-title'>Tutorías Agendadas</h1>
        {errorMsg && <p style={{color: 'red', fontWeight: 'bold'}}>{errorMsg}</p>}

        <div style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Filtrar por materia..." 
            value={filterMateria} 
            onChange={(e) => setFilterMateria(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
          <select 
            value={filterEstado} 
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="CANCELADA">CANCELADA</option>
            <option value="COMPLETADA">COMPLETADA</option>
          </select>

          <button 
            className='nav-link'
            style={{marginLeft: 'auto', background: '#e1e1e1', color: '#333', border: 'none', cursor: 'pointer', padding: '10px 15px', borderRadius: '4px'}}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            Ver como {viewMode === 'list' ? 'Calendario 📅' : 'Lista 📝'}
          </button>
        </div>
        
        {filteredReservas.length === 0 && !errorMsg ? (
          <p>No se encontraron tutorías con los filtros actuales.</p>
        ) : (
          viewMode === 'list' ? (
            <div className='cards-grid'>
              {filteredReservas.map(reserva => (
                <div key={reserva.id} className={`card ${reserva.isRemoving ? 'removing-card' : ''}`}>
                  <div>
                    <span className={`card-badge ${reserva.estado === 'ACTIVA' ? 'badge-success' : ''}`}>
                      {reserva.estado}
                    </span>
                    <h3 className='card-title'>{reserva.materiaNombre || 'Tutoría Solicitada'}</h3>
                    <p className='card-text'><strong>Fecha:</strong> {reserva.fechaSesion || 'Pendiente de asignar'}</p>
                    <p className='card-text'><strong>Hora:</strong> {reserva.horario}</p>
                    <p className='card-text'><strong>Tutor:</strong> {reserva.tutorNombre || reserva.tutorId}</p>
                    <p className='card-text'><strong>ID Reserva:</strong> #{reserva.id}</p>
                  </div>
                  {reserva.estado === 'ACTIVA' && (
                    <button 
                      className='btn-danger' 
                      onClick={() => handleCancelar(reserva.id)}>
                      Cancelar Tutoría
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{height: '600px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
              <Calendar
                localizer={localizer}
                events={filteredReservas}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
                max={new Date(0, 0, 0, 18, 0, 0)} // End at 6 PM
                date={calendarDate}
                onNavigate={(newDate) => setCalendarDate(newDate)}
                view={calendarView}
                onView={(newView) => setCalendarView(newView)}
                selectable={true}
                eventPropGetter={(event) => {
                  if (event.isRemoving) {
                    return { className: 'removing-event' };
                  }
                  if (event.estado === 'CANCELADA') {
                    return { className: 'cancelled-event' };
                  }
                  return { className: 'active-event' };
                }}
                onSelectEvent={(event) => {
                  Swal.fire({
                    title: `Tutoría de ${event.materiaNombre}`,
                    html: `
                      <p><strong>Tutor:</strong> ${event.tutorNombre}</p>
                      <p><strong>Horario:</strong> ${event.horario}</p>
                      <p><strong>Estado:</strong> <span class="card-badge ${event.estado === 'ACTIVA'? 'badge-success':''}">${event.estado}</span></p>
                      <p><strong>ID Reserva:</strong> #${event.id}</p>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Cerrar ventana'
                  });
                }}
                onSelectSlot={async (slotInfo) => {
                  const result = await Swal.fire({
                    title: '¿Buscar tutoría aquí?',
                    html: `Has seleccionado un espacio vacio desde el <b>${slotInfo.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b> al <b>${slotInfo.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b>.<br><br>¿Deseas ir al Catálogo para buscar y agendar una tutoría en este rango?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, ir al Catálogo',
                    cancelButtonText: 'Cancelar'
                  });
                  if (result.isConfirmed) {
                    const startParam = slotInfo.start.toISOString();
                    const endParam = slotInfo.end.toISOString();
                    navigate(`/catalogo?start=${startParam}&end=${endParam}`);
                  }
                }}
                messages={{
                  currentDate: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  agenda: 'Agenda',
                  today: 'Hoy',
                  previous: 'Atrás',
                  next: 'Siguiente',
                  showMore: total => `+ Ver más (${total})`
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
