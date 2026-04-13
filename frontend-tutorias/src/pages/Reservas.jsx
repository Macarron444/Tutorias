import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import './Dashboard.css';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await apiClient.get('/api/reservas');
        const data = response.data.content || response.data;
        
        // Si el microservicio de Java está vacío, ponemos datos de prueba para visualizar el diseño
        if (!data || data.length === 0) {
          setReservas([
            { id: 101, materia: 'Cálculo Diferencial', fecha: 'Jueves, 16 Abril, 10:00 AM', estado: 'CONFIRMADA' },
            { id: 102, materia: 'Estructuras de Datos', fecha: 'Viernes, 17 Abril, 02:00 PM', estado: 'PENDIENTE' }
          ]);
        } else {
          setReservas(data);
        }
      } catch (error) {
        console.error("Error obteniendo tus reservas", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchReservas();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior compartida */}
      <nav className="navbar">
        <div className="navbar-brand">📅 Mis Tutorías</div>
        <div className="navbar-links">
          <Link to="/catalogo" className="nav-link">Ver Catálogo</Link>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </nav>
      
      {/* Contenido Principal */}
      <div className="content-wrapper">
        <h1 className="page-title">Tutorías Agendadas</h1>
        
        {reservas.length === 0 ? (
          <p>Aún no tienes tutorías programadas.</p>
        ) : (
          <div className="cards-grid">
            {reservas.map(reserva => (
              <div key={reserva.id} className="card">
                <div>
                  <span className={`card-badge ${reserva.estado === 'CONFIRMADA' ? 'badge-success' : ''}`}>
                    {reserva.estado}
                  </span>
                  <h3 className="card-title">{(reserva.materia) || "Tutoría Solicitada"}</h3>
                  <p className="card-text"><strong>Fecha:</strong> {reserva.fecha || "Pendiente de asignar"}</p>
                  <p className="card-text"><strong>Ticket ID:</strong> #{reserva.id}</p>
                </div>
                <button 
                  className="btn-danger" 
                  onClick={() => alert(`Cancelando reserva #${reserva.id}...`)}>
                  Cancelar Tutoría
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}