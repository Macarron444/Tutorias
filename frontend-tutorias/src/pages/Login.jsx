import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axiosConfig';
import './Login.css';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login', { correo, password });
      localStorage.setItem('token', response.data.access_token);
      alert("Autenticación exitosa");
      navigate('/catalogo');
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return (
    <div className="login-container">
      {/* Figuras de fondo animadas adicionales */}
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>

      <div className="login-content">
        
        {/* Lado izquierdo al estilo moderno */}
        <div className="login-left">
          <h1 className="login-logo">Tutorías</h1>
          <h2 className="login-subtitle">
            Explora las tutorías universitarias y agenda <span className="highlight-text">lo que más te gusta.</span>
          </h2>
          {/* Cargamos la imagen de graduados que subiste */}
          <div className="image-wrapper">
            <img 
              src="/pixar-graduados.jfif" 
              alt="Graduados universitarios" 
              className="login-image" 
              onError={(e) => {
                // Imagen de respaldo
                e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        </div>

        {/* Formulario derecho (Tarjeta Blanca / Glassmorphism) */}
        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Correo electrónico o número de celular" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="login-input"
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-btn">
              Iniciar sesión
            </button>
            <a href="#" className="login-forgot">
              ¿Olvidaste tu contraseña?
            </a>
            
            <div className="login-divider"></div>
            
            <button type="button" className="login-register-btn" onClick={() => alert("Aquí abriremos el modal de Registro")}>
              Crear cuenta nueva
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}