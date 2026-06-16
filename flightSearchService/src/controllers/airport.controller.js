const { AirportService } = require("../services/index");
const { asyncHandler, successResponse } = require("shared");

const createAirport = asyncHandler(async (req, res) => {
  const data = await AirportService.create(req.body);
  successResponse(res, {
    data,
    message: "Successfully created the Airport.",
    statusCode: 201,
  });
});

const fetchAirport = asyncHandler(async (req, res) => {
  const data = await AirportService.fetch(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully fetched the Airport.",
  });
});

const updateAirport = asyncHandler(async (req, res) => {
  const data = await AirportService.update(req.params.id, req.body);
  successResponse(res, {
    data,
    message: "Successfully updated the Airport.",
  });
});

const deleteAirport = asyncHandler(async (req, res) => {
  const data = await AirportService.destroy(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully deleted the Airport.",
  });
});

const getAllAirports = asyncHandler(async (req, res) => {
  const data = await AirportService.fetchAll();
  successResponse(res, {
    data,
    message: "Successfully fetched all Airports.",
  });
});

module.exports = {
  createAirport,
  fetchAirport,
  updateAirport,
  deleteAirport,
  getAllAirports,
};