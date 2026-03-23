const AppError = require('../errors/appError');

const validate = (schema, source = "body") => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new AppError("Validation failed", 400, errors);
  }
  next();
};

module.exports = validate;
