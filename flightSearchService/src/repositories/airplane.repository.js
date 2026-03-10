const {Airplane} = require('../models/index');
const CrudRepository = require('./crud.repository');

class AirPlaneRepository extends CrudRepository{
   constructor(){
    super(Airplane);
   }
}

module.exports = AirPlaneRepository;