const {AirplaneService} = require('../services/index');
const createAirplane = async (req, res) => {
  try {
    const data = await AirplaneService.create(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the Airplane",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airplane controller",
      error: error,
    });
  }
};

const fetchAirplane = async (req, res) => {
  try {
    const data = await AirplaneService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the Airplane.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airplane controller",
      error: error,
    });
  }
};

const updateAirplane = async (req, res) => {
  try {
    const data = await AirplaneService.update(req.params.id,req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the Airplane.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airplane controller",
      error: error,
    });
  }
};

const deleteAirplane = async (req, res) => {
  try {
    const data = await AirplaneService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the Airplane.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the Airplane controller.",
      error: error,
    });
  }
};

module.exports = {
    createAirplane,
    fetchAirplane,
    updateAirplane,
    deleteAirplane
}