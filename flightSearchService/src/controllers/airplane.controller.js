const { AirplaneService } = require("../services/index");
const { asyncHandler, successResponse } = require("shared");

const createAirplane = asyncHandler(async (req, res) => {
  const data = await AirplaneService.create(req.body);
  successResponse(res, {
    data: data,
    message: "Successfully created the Airplane",
    statusCode: 200,
  });
});

const fetchAirplane = asyncHandler(async (req, res) => {
  const data = await AirplaneService.fetch(req.params.id);
  successResponse(res, {
    data: data,
    message: "Successfully fetched the Airplane",
    statusCode: 200,
  });
});

const updateAirplane = asyncHandler(async (req, res) => {
  const data = await AirplaneService.update(req.params.id, req.body);
  successResponse(res, {
    data,
    message: "Successfully updated the Airplane.",
  });
});

const deleteAirplane = asyncHandler(async (req, res) => {
  const data = await AirplaneService.destroy(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully deleted the Airplane.",
  });
});

module.exports = {
  createAirplane,
  fetchAirplane,
  updateAirplane,
  deleteAirplane,
};
