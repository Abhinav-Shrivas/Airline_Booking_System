class AppError extends Error {
  constructor(message = "Something went wrong.", statusCode = 500, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.success = false; 
    this.errors = errors; 
    this.isOperational = true; //Expected error- Eg. User not found- ✅true, Unexpected bug- Eg. undefined variable-	❌false

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;