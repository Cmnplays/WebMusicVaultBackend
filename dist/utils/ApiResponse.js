"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(status, message = "success", data, messages) {
        this.status = status;
        this.message = message;
        this.data = data;
        if (messages) {
            this.messages = messages;
        }
    }
}
exports.default = ApiResponse;
