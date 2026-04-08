class DisponibilidadController {
  constructor(service) {
    this.service = service;
  }

  crear = async (req, res) => {
    try {
      await this.service.crearBloque(req.body);
      res.json({ message: 'Bloque creado' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = DisponibilidadController;