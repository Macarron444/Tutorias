import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import './Dashboard.css';

export default function Catalogo() {
  const [materias, setMaterias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await apiClient.get('/api/materias');
        // Si el microservicio Node está vacío, inyectamos datos de prueba para visualizar el diseño temporalmente
        if (response.data.length === 0) {
          setMaterias([
            { id: 1, nombre: 'Cálculo Diferencial', codigo: 'MAT101', departamento: 'Matemáticas Universitarias' },
            { id: 2, nombre: 'Física Matemática', codigo: 'FIS204', departamento: 'Física y Ciencias' },
            { id: 3, nombre: 'Lógica Computacional', codigo: 'SIS301', departamento: 'Ingeniería de Sistemas' },
            { id: 4, nombre: 'Estructuras de Datos', codigo: 'SIS305', departamento: 'Ingeniería de Sistemas' },
          ]);
        } else {
          setMaterias(response.data);
        }
      } catch (error) {
        console.error("Error obteniendo el catálogo", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchMaterias();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Barra de navegación superior */}
      <nav className="navbar">
        <div className="navbar-brand">🎓 Tutorías App</div>
        <div className="navbar-links">
          <Link to="/reservas" className="nav-link">Mis Reservas</Link>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </nav>
      
      {/* Contenido Principal */}
      <div className="content-wrapper">
        <h1 className="page-title">Catálogo de Materias Disponibles</h1>
        
        {materias.length === 0 ? (
          <p>No hay materias disponibles.</p>
        ) : (
          <div className="cards-grid">
            {materias.map(materia => (
              <div key={materia.id} className="card">
                <div>
                  <span className="card-badge">{materia.codigo}</span>
                  <h3 className="card-title">{materia.nombre}</h3>
                  <p className="card-text"><strong>Departamento:</strong> {materia.departamento || 'General'}</p>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => alert(`Abriendo disponibilidad para ${materia.nombre}`)}>
                  Ver Franjas y Agendar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}