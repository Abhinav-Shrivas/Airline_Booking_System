const { Booking, Passenger, Payment, sequelize } = require("../models");
const CrudRepository = require("./crud.repository");
const { Op } = require("sequelize");
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
  async createBookingWithPassengers(bookingData, passengers) {
    return await sequelize.transaction(async (t) => {
      const booking = await Booking.create(bookingData, { transaction: t });
      if (passengers && passengers.length > 0) {
        const passengersWithBookingId = passengers.map((p) => ({
          ...p,
          bookingId: booking.id,
        }));
        await Passenger.bulkCreate(passengersWithBookingId, { transaction: t });
      }

      return booking;
    });
  }

  async findByIdWithDetails(id) {
    return await Booking.findByPk(id, {
      include: [
        { model: Passenger, as: "passengers" },
        { model: Payment, as: "payment" },
      ],
    });
  }

  async findConfirmedBookings() {
    return await Booking.findAll({
      where: { status: "CONFIRMED" },
    });
  }

  async findByUserId(userId) {
    return await Booking.findAll({
      where: { userId },
      include: [{ model: Payment, as: "payment" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async findExpiredBookings(ttlMinutes = 10) {
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);
    return await Booking.findAll({
      where: {
        status: "INITIATED",
        createdAt: { [Op.lt]: cutoff },
      },
    });
  }
}

module.exports = BookingRepository;
