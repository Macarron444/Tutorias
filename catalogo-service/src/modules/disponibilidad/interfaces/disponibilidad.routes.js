const router = require('express').Router();
const Repo = require('../infrastructure/disponibilidad.repository');
const Service = require('../application/disponibilidad.service');
const Controller = require('./disponibilidad.controller');

const repo = new Repo();
const service = new Service(repo);
const controller = new Controller(service);

router.post('/', controller.crear);

// ---- Endpoints requeridos por reservas-service (Nicolas) ----
router.get('/:bloqueId/disponible', controller.verificarDisponible);
router.put('/:bloqueId/bloquear', controller.bloquear);
router.put('/:bloqueId/liberar', controller.liberar);

// ---- Endpoint para frontend ----
router.get('/materia/:materiaId', controller.franjasPorMateria);

module.exports = router;