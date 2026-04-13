import axios from 'axios';

// Instancia de Axios. Ya NO usamos baseURL fijo completo, porque Vite 
// está configurado como proxy en desarrollo. En producción, 
// compartiremos el mismo dominio del API Gateway.
export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token de seguridad (del microservicio de Python)
apiClient.interceptors.request.use(
  (config) => {
    // Cuando el usuario inicie sesión, guardaremos su token en el localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);