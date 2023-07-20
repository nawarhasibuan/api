"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const controller_1 = require("./controller");
const validation_1 = require("./validation");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/me", auth_1.auth, controller_1.getProfile);
userRoutes.put("/", auth_1.auth, validation_1.validateEdit, controller_1.editProfile);
userRoutes.post("/register", validation_1.validateRegist, controller_1.registerUser);
userRoutes.post("/login", validation_1.validateLogin, controller_1.loginUser);
userRoutes.post("/forgot", controller_1.forgotPassword);
userRoutes.put("/reset-password/:resetToken", controller_1.resetPassword);
exports.default = userRoutes;
