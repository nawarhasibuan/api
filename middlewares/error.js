"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const mongoose_1 = __importDefault(require("mongoose"));
function handleError(err, req, res, next) {
    let customError;
    if (!(err instanceof CustomError_1.default)) {
        customError = new CustomError_1.default(err.message);
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        customError = new CustomError_1.default(err.name, 400);
        const errors = Object.values(err.errors).map((val) => ({
            field: val.path,
            message: val.message,
        }));
        errors.forEach((val) => {
            customError === null || customError === void 0 ? void 0 : customError.push(val);
        });
    }
    if (!customError) {
        customError = err;
    }
    const errors = customError.errors.length > 0
        ? customError.errors
        : undefined;
    res
        .status(customError.status)
        .json({ message: (customError === null || customError === void 0 ? void 0 : customError.message) || err.message, errors });
}
exports.handleError = handleError;
