class CrudService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async fetch(id) {
    return await this.repository.fetch(id);
  }

  async fetchAll() {
    return await this.repository.fetchAll();
  }

  async update(id, data) {
    return await this.repository.update(id, data);
  }

  async destroy(id) {
    return await this.repository.destroy(id);
  }
}

module.exports = CrudService;
