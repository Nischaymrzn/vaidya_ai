class ApiError extends Error {
  status: number;

  constructor(status: number = 400, message: string) {
    super(message);
    this.status = status;
  }

  toJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      data: {},
    };
  }
}

export default ApiError;
