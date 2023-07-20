"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const controller_1 = require("./controller");
const validation_1 = require("./validation");
const warisRoutes = (0, express_1.Router)();
warisRoutes.get("/", controller_1.getRelation);
warisRoutes.post("/", validation_1.validatInput, controller_1.getSaham);
warisRoutes.post("/save", auth_1.auth, validation_1.validatInput, controller_1.saveCase);
exports.default = warisRoutes;