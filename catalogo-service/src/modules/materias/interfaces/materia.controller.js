class MateriaController {
  constructor(service) {
    this.service = service;
  }

  getAll = async (req, res) => {
    const data = await this.service.getAll();
    res.json(data);
  };

  create = async (req, res) => {
    try {
      await this.service.create(req.body);
      res.json({ message: 'Materia creada' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = MateriaController;