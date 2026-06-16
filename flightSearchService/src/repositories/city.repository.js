const { City } = require("../models/index");
const { Op } = require("sequelize");
const CrudRepository = require("./crud.repository");

class CityRepository extends CrudRepository {
  constructor() {
    super(City);
  }

  async getAllCities(search) {
    if (!search) {
      return await City.findAll();
    }
    const result = await City.findAll({
      where: {
        name: {
          [Op.iLike]: `${search}%`,
        },
      },
      limit: 5,
    });
    return result;
  }
}

module.exports = CityRepository;
