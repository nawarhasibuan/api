"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const auth = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            throw new CustomError_1.default("Akses ditolak.", 401).push({
                field: "token",
                message: "Tidak ada token",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new CustomError_1.default("Akses ditolak", 401).push({
                field: "token",
                message: "Token kadaluarsa silahkan login ulang",
            }));
            return;
        }
        else if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
            next(new CustomError_1.default("Akses ditolak", 401).push({
                field: "token",
                message: "Token kadaluarsa silahkan login ulang",
            }));
            return;
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new CustomError_1.default("Akses ditolak", 401).push({
                field: "token",
                message: "Token tidak valid silahkan login ulang",
            }));
            return;
        }
        next(error);
    }
};
exports.auth = auth;
