class ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  messages?: string[];
  constructor(
    status: number,
    message = "success",
    data: T,
    messages?: string[]
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
    if (messages) {
      this.messages = messages;
    }
  }
}

export default ApiResponse;
