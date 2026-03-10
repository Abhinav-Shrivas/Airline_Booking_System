const { City } = require("../models/index");
const { Op } = require("sequelize");
const CrudRepository = require("./crud.repository");

class CityRepository extends CrudRepository {
  constructor() {
    super(City);
  }
  async getAllCities(search) {
    try {
      const result = await City.findAll({
        where: {
          name: {
            [Op.like]: `${search}%`,
          },
        },
        limit: 5,
      });
      return result;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = CityRepository;
