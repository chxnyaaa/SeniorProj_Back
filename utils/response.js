class ApiResponse {
  static success(res, detail, statusCode = 200, statusMessage = 'Success') {
    return res.status(200).json({
      status_code: statusCode,
      status_message: statusMessage,
      detail,
    });
  }

  static error(res, detail, statusCode = 500, statusMessage = 'Error') {
    return res.status(200).json({
      status_code: statusCode,
      status_message: statusMessage,
      detail,
    });
  }

  static info(res, detail, statusCode = 200, statusMessage = 'Info') {
    return res.status(statusCode).json({
      status_code: statusCode,
      status_message: statusMessage,
      detail,
    });
  }
}

export default ApiResponse; // ✅ แทนที่ module.exports
