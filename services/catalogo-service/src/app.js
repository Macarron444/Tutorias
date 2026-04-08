const express = require('express');
const app = express();

app.use(express.json());

app.use('/materias', require('./modules/materias/interfaces/materia.routes'));
app.use('/disponibilidad', require('./modules/disponibilidad/interfaces/disponibilidad.routes'));

app.get('/health', (req, res) => res.send('OK'));

module.exports = app;