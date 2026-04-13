import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import Swal from 'sweetalert2';
import './Dashboard.css';

const parseUtcDate = (fechaStr) => {
  const d = new Date(fechaStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
};

export default function Catalogo() {
  const [user, setUser] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [materiaSelected, setMateriaSelected] = useState(null);
  const [franjas, setFranjas] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filtros
  const [filterMateria, setFilterMateria] = useState('');
  const [filterHoraInicio, setFilterHoraInicio] = useState(
    searchParams.get('start') ? new Date(searchParams.get('start')).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : ''
  );
  const [filterHoraFin, setFilterHoraFin] = useState(
    searchParams.get('end') ? new Date(searchParams.get('end')).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : ''
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data);
      } catch (err) { console.error(err); }
    };
    fetchUserData();

    const fetchMaterias = async () => {
      try {
        const response = await apiClient.get('/api/materias/');
        if (response.data && response.data.length > 0) {
          
          // Traer bloques de cada materia para permitir filtrar por tiempo
          const materiasPromises = response.data.map(async m => {
            try {
              const resBloques = await apiClient.get('/api/bloques/materia/' + m.id);
              m.bloquesData = resBloques.data;
            } catch(e) {
              m.bloquesData = [];
            }
            return m;
          });
          const mats = await Promise.all(materiasPromises);
          
          setMaterias(mats);
        } else {
          setMaterias([]);
        }
      } catch (error) {
        console.error('Error obteniendo el catálogo', error);
        setErrorMsg('Error cargando materias: ' + (error.message || ''));
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchMaterias();
  }, [navigate]);

  const openModal = async (materia) => {
    setMateriaSelected(materia);
    setModalOpen(true);
    try {
      const res = await apiClient.get('/api/bloques/materia/' + materia.id);
      
      const franjasDetalladas = await Promise.all(res.data.map(async f => {
        
        // Ajustar fechas al futuro: si la franja ya pasó esta semana, sumarle 7 días hasta que sea futura
        let inicioDate = parseUtcDate(f.fecha_inicio);
        let finDate = parseUtcDate(f.fecha_fin);
        const ahora = new Date();
        
        while (inicioDate < ahora) {
          inicioDate.setDate(inicioDate.getDate() + 7);
          finDate.setDate(finDate.getDate() + 7);
        }
        
        // Formatear el día de la semana
        const opcionesDia = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const diaLegible = inicioDate.toLocaleDateString('es-ES', opcionesDia);
        // Capitalizar la primera letra
        const diaCapitalizado = diaLegible.charAt(0).toUpperCase() + diaLegible.slice(1);
        
        let objTutor = { tutorNombre: f.tutor_id };
        try {
          const r = await apiClient.get('/api/usuarios/' + f.tutor_id + '/nombre');
          objTutor.tutorNombre = r.data.nombre;
        } catch(e) {}
        
        return { 
          ...f, 
          ...objTutor,
          fecha_inicio_ajustada: inicioDate,
          fecha_fin_ajustada: finDate,
          dia_legible: diaCapitalizado
        };
      }));
      
      // Ordenar cronológicamente para que la fecha más próxima salga de primeras
      franjasDetalladas.sort((a, b) => a.fecha_inicio_ajustada - b.fecha_inicio_ajustada);
      
      setFranjas(franjasDetalladas);
    } catch(err) { console.error(err); }
  };

  const agendar = async (f) => {
    try {
      if (!user) { Swal.fire('Error', 'Debes iniciar sesión', 'error'); return; }
      
      // Asegurarse de mantener el formateo local yeyo: "YYYY-MM-DD"
      const yyyy = f.fecha_inicio_ajustada.getFullYear();
      const mm = String(f.fecha_inicio_ajustada.getMonth() + 1).padStart(2, '0');
      const dd = String(f.fecha_inicio_ajustada.getDate()).padStart(2, '0');

      const payload = { 
        estudianteId: user.correo, 
        tutorId: f.tutor_id,
        bloqueDisponibilidadId: f.id,
        materiaId: materiaSelected.id.toString(),
        fechaSesion: `${yyyy}-${mm}-${dd}`
      };
      
      // Enviar la petición al microservicio de Java (Cruce total del diagrama UML)
      await apiClient.post('/api/reservas', payload);
      Swal.fire({
        title: '¡Reserva exitosa!',
        text: 'Tu tutoría ha sido agendada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      setModalOpen(false);
    } catch(err) { 
      console.error(err.response?.data || err);
      Swal.fire('Error al reservar', (err.response?.data?.mensaje || err.message), 'error'); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const normalizeString = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const filteredMaterias = materias.filter(m => {
    // Filtro por nombre
    if (filterMateria && !normalizeString(m.nombre).includes(normalizeString(filterMateria))) return false;

    // Filtro por horario
    if ((filterHoraInicio || filterHoraFin) && m.bloquesData) {
      const tieneBloqueValido = m.bloquesData.some(b => {
        const bi = parseUtcDate(b.fecha_inicio).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});
        const bf = parseUtcDate(b.fecha_fin).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});

        // Si el usuario pide un inicio, el bloque debe comenzar antes o igual.
        const checkStart = filterHoraInicio ? bi <= filterHoraInicio : true;
        // Si el usuario pide un fin, el bloque debe terminar después o igual.
        const checkEnd = filterHoraFin ? bf >= filterHoraFin : true;

        // Validar también que la franja de tiempo requerida al menos se superponga o esté contenida.
        // Si hay ambos filtros (inicio y fin), el bloque debe poder acomodar toda la sesión (bi <= reqStart Y bf >= reqEnd).
        // (La lógica de arriba ya hace exactamente esto).

        return checkStart && checkEnd;
      });

      if (!tieneBloqueValido) return false;
    }

    return true;
  });

  return (
    <>
      <div className='dashboard-container'>
        <nav className='navbar'>
          <div className='navbar-brand'>🎓 Tutorías App</div>
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
          <Link to='/reservas' className='nav-link'>Mis Reservas</Link>
          <button onClick={handleLogout} className='btn-logout'>Cerrar Sesión</button>
        </div>
      </nav>
      
      <div className='content-wrapper'>
        <h1 className='page-title'>Catálogo de Materias Disponibles</h1>
        {errorMsg && <p style={{color: 'red', fontWeight: 'bold'}}>{errorMsg}</p>}

        <div style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
          <input 
            type="text" 
            placeholder="Buscar materia..." 
            value={filterMateria} 
            onChange={(e) => setFilterMateria(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '300px'}}
          />
          <label style={{fontWeight: 'bold', marginLeft: '10px'}}>Disponible desde:</label>
          <input 
            type="time" 
            value={filterHoraInicio} 
            onChange={(e) => setFilterHoraInicio(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
          <label style={{fontWeight: 'bold'}}>hasta:</label>
          <input 
            type="time" 
            value={filterHoraFin} 
            onChange={(e) => setFilterHoraFin(e.target.value)}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
          {(filterHoraInicio || filterHoraFin) && (
            <button 
              className='btn-danger' 
              style={{padding: '8px 12px'}} 
              onClick={() => { setFilterHoraInicio(''); setFilterHoraFin(''); }}
            >
              Limpiar horas
            </button>
          )}
        </div>
        
        {filteredMaterias.length === 0 && !errorMsg ? (
          <p>No se encontraron materias con los filtros actuales.</p>
        ) : (
          <div className='cards-grid'>
            {filteredMaterias.map(materia => (
              <div key={materia.id} className='card'>
                <div>
                  <span className='card-badge'>Cod: {materia.id}</span>
                  <h3 className='card-title'>{materia.nombre}</h3>
                  <p className='card-text'>{materia.descripcion}</p>
                </div>
                <button 
                  className='btn-primary' 
                  onClick={() => openModal(materia)}>
                  Ver Franjas y Agendar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2>Tutores y Franjas - {materiaSelected?.nombre}</h2>
              <button className='btn-close-modal' onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className='modal-body'>
              {franjas.length === 0 ? <p>No hay horarios disponibles para esta materia.</p> : franjas.map(f => (
                <div key={f.id} className='modal-item'>
                  <p><strong>Tutor:</strong> {f.tutorNombre || f.tutor_id}</p>
                    <p><strong>Día:</strong> {f.dia_legible || 'Programado'}</p>
                    <p><strong>Horario:</strong> {f.fecha_inicio_ajustada.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {f.fecha_fin_ajustada.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <button className='btn-primary' onClick={() => agendar(f)}>Confirmar Reserva</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
