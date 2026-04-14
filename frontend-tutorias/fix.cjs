const fs=require('fs'); 
let c=fs.readFileSync('c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/ReservasEstudiante.jsx','utf8'); 
c=c.replace(/catalogo\?start/g, 'dashboard?start'); 
fs.writeFileSync('c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/ReservasEstudiante.jsx', c);
