const { CityRepository } = require("../repositories/index");
const CrudService = require("../services/crud.service");

const cityRepository = new CityRepository();
/* 
✅ Why classes in repositories & services ?
They store dependencies (like models, other services)
You create them once and reuse them
You can swap dependencies later (DB, mock, etc.)
They group related logic cleanly
*/

class CityService extends CrudService {
  constructor() {
    super(cityRepository);
  }
  async getAllCities(search) {
      return await cityRepository.getAllCities(search);
  }
}

module.exports = new CityService();
