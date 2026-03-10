const {CityService} = require('../services/index');

/* 
✅ Why functions in controllers ?
Controllers don’t store anything
They just handle request → response
Each request is independent
Using a class gives no extra benefit
*/

const createCity = async (req, res) => {
  try {
    const data = await CityService.create(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the city",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the city controller",
      error: error,
    });
  }
};

const fetchCity = async (req, res) => {
  try {
    const data = await CityService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the city.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the city controller",
      error: error,
    });
  }
};

const getAllCities = async (req,res) => {
  try {
    const data = await CityService.getAllCities(req.query.search);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched all the city.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the city controller",
      error: error,
    });
  }
}

const updateCity = async (req, res) => {
  try {
    const data = await CityService.update(req.params.id,req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the city.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the city controller",
      error: error,
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    const data = await CityService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the city.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the city controller.",
      error: error,
    });
  }
};

module.exports = {
    createCity,
    fetchCity,
    updateCity,
    deleteCity,
    getAllCities
}