const router = require('express').Router();
const Repo = require('../infrastructure/disponibilidad.repository');
const Service = require('../application/disponibilidad.service');
const Controller = require('./disponibilidad.controller');

const repo = new Repo();
const service = new Service(repo);
const controller = new Controller(service);

router.post('/', controller.crear);

module.exports = router;