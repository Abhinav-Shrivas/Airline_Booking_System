// normal import crudrepo and make its obj in construcotr

class CrudService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      const response = await this.repository.create(data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await this.repository.fetch(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await this.repository.update(id, data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async destroy(id) {
    try {
      const response = await this.repository.destroy(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
}

module.exports = CrudService;
