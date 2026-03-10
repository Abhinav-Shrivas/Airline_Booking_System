const {AirPlaneRepository} = require("../repositories/index");
const CrudService = require("../services/crud.service");

const airplaneRepository = new AirPlaneRepository();

class AirplaneService extends CrudService{
  constructor() {
    super(airplaneRepository);
  }
}

module.exports = new AirplaneService();
