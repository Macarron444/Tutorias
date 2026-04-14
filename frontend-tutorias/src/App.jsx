import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardEstudiante from './pages/DashboardEstudiante';
import ReservasEstudiante from './pages/ReservasEstudiante';
import PanelTutor from './pages/PanelTutor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardEstudiante />} />
        <Route path="/reservas" element={<ReservasEstudiante />} />
        <Route path="/tutor" element={<PanelTutor />} />
      </Routes>
    </Router>
  );
}

export default App;
