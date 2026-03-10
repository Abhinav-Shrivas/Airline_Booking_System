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

// just call super() and in its below line do make object of cityRepo
class CityService extends CrudService {
  constructor() {
    super(cityRepository);
  }
  async getAllCities(search) {
    try {
      const response = await this.repository.getAllCities(search);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
}

module.exports = new CityService();
