const { CityService } = require("../services/index");
const { asyncHandler, successResponse } = require("shared");

/*
✅ Why functions in controllers ?
Controllers don't store anything
They just handle request → response
Each request is independent
Using a class gives no extra benefit
*/

const createCity = asyncHandler(async (req, res) => {
  const data = await CityService.create(req.body);
  successResponse(res, {
    data,
    message: "Successfully created the City.",
    statusCode: 201,
  });
});

const fetchCity = asyncHandler(async (req, res) => {
  const data = await CityService.fetch(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully fetched the City.",
  });
});

const getAllCities = asyncHandler(async (req, res) => {
  const data = await CityService.getAllCities(req.query.search);
  successResponse(res, {
    data,
    message: "Successfully fetched all cities.",
  });
});

const updateCity = asyncHandler(async (req, res) => {
  const data = await CityService.update(req.params.id, req.body);
  successResponse(res, {
    data,
    message: "Successfully updated the City.",
  });
});

const deleteCity = asyncHandler(async (req, res) => {
  const data = await CityService.destroy(req.params.id);
  successResponse(res, {
    data,
    message: "Successfully deleted the City.",
  });
});

module.exports = {
  createCity,
  fetchCity,
  updateCity,
  deleteCity,
  getAllCities,
};