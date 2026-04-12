'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Booking,{
        foreignKey : "bookingId",
        as : "passengers",
        onDelete : "CASCADE"
      })
    }
  }
  Passenger.init({
    bookingId: {type:DataTypes.INTEGER,allowNull:false},
    fullName: {type:DataTypes.STRING,allowNull:false},
    age: {type:DataTypes.INTEGER, allowNull:false},
    seatNo: {type:DataTypes.STRING,allowNull:false}
  }, {
    sequelize,
    modelName: 'Passenger',
  });
  return Passenger;
};