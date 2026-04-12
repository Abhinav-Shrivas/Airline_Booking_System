const { Passenger } = require("../models");
const CrudRepository = require("./crud.repository");

class PassengerRepository extends CrudRepository {
  constructor() {
    super(Passenger);
  }
}

module.exports = PassengerRepository;
