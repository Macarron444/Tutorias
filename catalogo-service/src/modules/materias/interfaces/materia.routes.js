const router = require('express').Router();
const MateriaRepository = require('../infrastructure/materia.repository');
const MateriaService = require('../application/materia.service');
const MateriaController = require('./materia.controller');

const repo = new MateriaRepository();
const service = new MateriaService(repo);
const controller = new MateriaController(service);

router.get('/', controller.getAll);
router.post('/', controller.create);

module.exports = router;