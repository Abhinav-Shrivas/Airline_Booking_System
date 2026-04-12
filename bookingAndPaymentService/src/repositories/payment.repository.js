const { Payment } = require("../models");
const CrudRepository = require("./crud.repository");

class PaymentRepository extends CrudRepository {
  constructor() {
    super(Payment);
  }

  async findByBookingId(bookingId) {
    return await Payment.findOne({ where: { bookingId } });
  }
}

module.exports = PaymentRepository;
