const express = require('express');
const app = express();

app.use(express.json());

// app.js
app.use('/api/materias', require('./modules/materias/interfaces/materia.routes'));
app.use('/api/bloques', require('./modules/disponibilidad/interfaces/disponibilidad.routes'));
app.get('/api/health', (req, res) => res.send('OK'));

module.exports = app;