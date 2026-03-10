const { FlightService } = require("../services/index");

const createFlight = async (req, res) => {
  try {
    const data = await FlightService.create(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the Flight",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Flight controller",
      error: error,
    });
  }
};

const fetchFlight = async (req, res) => {
  try {
    const data = await FlightService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the Flight.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Flight controller",
      error: error,
    });
  }
};

const getFlights = async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      noOfSeats: req.query.noOfSeats,
      departureDate: req.query.departureDate,
      returnDate: req.query.returnDate,
      trip: req.query.trip,
      sort : req.query.sort,
      moreFlights : req.query.moreFlights
    };
    const data = await FlightService.getFlights(filters);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the Flight.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Flight controller",
      error: error,
    });
  }
};

const updateFlight = async (req, res) => {
  try {
    const data = await FlightService.update(req.params.id, req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the Flight.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Flight controller",
      error: error,
    });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const data = await FlightService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the Flight.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Flight controller.",
      error: error,
    });
  }
};

module.exports = {
  createFlight,
  fetchFlight,
  updateFlight,
  deleteFlight,
  getFlights,
};
