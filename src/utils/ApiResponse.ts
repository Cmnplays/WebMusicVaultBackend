class ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  constructor(status: number, message = "success", data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
