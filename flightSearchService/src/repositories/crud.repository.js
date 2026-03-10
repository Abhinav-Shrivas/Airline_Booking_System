class CrudRepository {
  constructor(model) {
    this.newModel = model;
  }
  async create(data) {
    try {
      const response = await this.newModel.create(data);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await this.newModel.findByPk(id);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async update(id, data) {
    try {
      await this.newModel.update(data, {
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      console.log("Something went wrong in the repository layer.");
      throw error;
    }
  }

  async destroy(id) {
    try {
      await this.newModel.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = CrudRepository;
