class DisponibilidadController {
  constructor(service) {
    this.service = service;
  }

  crear = async (req, res) => {
    try {
      const id = await this.service.crearBloque(req.body);
      res.status(201).json({ message: 'Bloque creado', id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  verificarDisponible = async (req, res) => {
    try {
      const bloque = await this.service.obtenerBloque(req.params.bloqueId);
      if (!bloque) return res.status(404).json({ error: 'Bloque no encontrado' });
      res.json(bloque);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  bloquear = async (req, res) => {
    try {
      await this.service.cambiarEstado(req.params.bloqueId, 'RESERVADO');
      res.json({ message: 'Bloque bloqueado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  liberar = async (req, res) => {
    try {
      await this.service.cambiarEstado(req.params.bloqueId, 'LIBRE');
      res.json({ message: 'Bloque liberado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = DisponibilidadController;