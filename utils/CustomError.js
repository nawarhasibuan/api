"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(message, status = 500, errors = []) {
        super(message);
        this.name = "CustomError";
        this.status = status;
        this.errors = errors;
    }
    push(err) {
        this.errors.push(err);
        return this;
    }
}
exports.default = CustomError;
