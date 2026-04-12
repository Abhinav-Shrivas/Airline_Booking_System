const {AirplaneRepository} = require("../repositories/index");
const CrudService = require("../services/crud.service");

const airplaneRepository = new AirplaneRepository();

class AirplaneService extends CrudService{
  constructor() {
    super(airplaneRepository);
  }
}

module.exports = new AirplaneService();
