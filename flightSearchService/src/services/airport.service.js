const {AirportRepository} = require("../repositories/index");
const CrudService = require("../services/crud.service");

const airportRepository = new AirportRepository();

class AirportService extends CrudService{
  constructor() {
    super(airportRepository);
  }
}

module.exports = new AirportService();
