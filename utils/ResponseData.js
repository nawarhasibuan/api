"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = __importDefault(require("./CustomError"));
class ResponseData {
    constructor(message, data, errors) {
        this.message = message;
        this.data = data;
        this.errors = errors;
    }
    addLink(self, base = "/", query) {
        const link = (curr) => {
            return `http://localhost:3000${base}?&page=${curr}${query}`;
        };
        this.links = { self: link(self), prev: link(self - 1), next: link(self + 1) };
        if (self <= 1) {
            this.links.prev = null;
        }
        if (this.data.length < 1) {
            this.links.next = null;
        }
        return this;
    }
    addErrors(errors) {
        this.errors = errors;
        return this;
    }
    pushError(error) {
        if (!this.errors) {
            this.errors = new CustomError_1.default("");
        }
        this.errors.push(error);
        return this;
    }
    toJSON() {
        var _a;
        return {
            message: this.message,
            data: this.data,
            links: this.links,
            errors: (_a = this.errors) === null || _a === void 0 ? void 0 : _a.errors,
        };
    }
}
exports.default = ResponseData;
