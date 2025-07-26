"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(status, message = "success", data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.default = ApiResponse;
