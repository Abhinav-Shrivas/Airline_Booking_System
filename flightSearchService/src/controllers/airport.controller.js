const {AirportService} = require('../services/index');
const createAirport = async (req, res) => {
  try {
    const data = await AirportService.create(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the Airport",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airport controller",
      error: error,
    });
  }
};

const fetchAirport = async (req, res) => {
  try {
    const data = await AirportService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the Airport.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airport controller",
      error: error,
    });
  }
};

const updateAirport = async (req, res) => {
  try {
    const data = await AirportService.update(req.params.id,req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the Airport.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airport controller",
      error: error,
    });
  }
};

const deleteAirport = async (req, res) => {
  try {
    const data = await AirportService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the Airport.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airport controller.",
      error: error,
    });
  }
};

module.exports = {
    createAirport,
    fetchAirport,
    updateAirport,
    deleteAirport
}