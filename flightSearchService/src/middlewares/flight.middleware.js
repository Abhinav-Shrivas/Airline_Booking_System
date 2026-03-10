const validateGetFlights = (req, res, next) => {
  const { from, to, departureDate, noOfSeats, trip, returnDate } = req.query;

  // Required params
  if (!from || !to || !departureDate || !noOfSeats) {
    return res.status(400).json({
      success: false,
      message: "Missing required query params: from, to, departureDate, noOfSeats",
      data: {},
      error: {},
    });
  }

  // Convert seats to number
  const seats = Number(noOfSeats);

  if (Number.isNaN(seats) || seats <= 0) {
    return res.status(400).json({
      success: false,
      message: "noOfSeats must be a positive integer",
      data: {},
      error: {},
    });
  }

  req.query.noOfSeats = seats;

  // Validate departure date
  const depDate = new Date(departureDate);

  if (Number.isNaN(depDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid departureDate format",
      data: {},
      error: {},
    });
  }

  // Round trip validation
  if (trip === "round") {
    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: "returnDate is required for round trips",
        data: {},
        error: {},
      });
    }

    const retDate = new Date(returnDate);

    if (Number.isNaN(retDate.getTime()) || retDate <= depDate) {
      return res.status(400).json({
        success: false,
        message: "returnDate must be a valid date after departureDate",
        data: {},
        error: {},
      });
    }
  }

  next();
};

module.exports = { validateGetFlights };