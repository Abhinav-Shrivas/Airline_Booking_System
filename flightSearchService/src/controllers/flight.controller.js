const { FlightService } = require("../services/index");
const { asyncHandler, successResponse } = require("shared");

const createFlight = asyncHandler(async (req, res) => {
  const data = await FlightService.create(req.body);
  successResponse(res, {
    data,
    message: "Successfully created the Flight.",
    statusCode: 201,
  });
});

const fetchFlight = asyncHandler(async (req, res) => {
  const data = await FlightService.fetch(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully fetched the Flight.",
  });
});

const getFlights = asyncHandler(async (req, res) => {
  const filters = {
    from: req.query.from,
    to: req.query.to,
    noOfSeats: req.query.noOfSeats,
    departureDate: req.query.departureDate,
    returnDate: req.query.returnDate,
    trip: req.query.trip,
    sort: req.query.sort,
    moreFlights: req.query.moreFlights,
  };
  const data = await FlightService.getFlights(filters);
  successResponse(res, {
    data,
    message: "Successfully fetched flights.",
  });
});

const updateFlight = asyncHandler(async (req, res) => {
  const data = await FlightService.update(req.params.id, req.body);
  successResponse(res, {
    data,
    message: "Successfully updated the Flight.",
  });
});

const deleteFlight = asyncHandler(async (req, res) => {
  const data = await FlightService.destroy(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully deleted the Flight.",
  });
});

module.exports = {
  createFlight,
  fetchFlight,
  updateFlight,
  deleteFlight,
  getFlights,
};
