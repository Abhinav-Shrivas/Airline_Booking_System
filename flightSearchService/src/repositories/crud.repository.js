class CrudRepository {
  constructor(model) {
    this.newModel = model;
  }

  async create(data) {
    const response = await this.newModel.create(data);
    return response;
  }

  async fetch(id) {
    const response = await this.newModel.findByPk(id);
    return response;
  }

  async fetchAll() {
    const response = await this.newModel.findAll();
    return response;
  }

  async update(id, data) {
    await this.newModel.update(data, {
      where: {
        id: id,
      },
    });
    return true;
  }

  async destroy(id) {
    await this.newModel.destroy({ where: { id } });
    return true;
  }
}

module.exports = CrudRepository;
