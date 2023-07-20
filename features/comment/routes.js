"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middlewares/auth");
const authorizeAdmin_1 = require("../../middlewares/authorizeAdmin");
const validation_1 = require("./validation");
const commentRoutes = (0, express_1.Router)();
commentRoutes.get("/", validation_1.validateIds, controller_1.getComments);
commentRoutes.post("/", auth_1.auth, validation_1.validateCreate, controller_1.createComment);
commentRoutes.get("/:id", controller_1.getCommentById);
commentRoutes.delete("/:id", auth_1.auth, authorizeAdmin_1.authorizeAdmin, controller_1.deleteComment);
exports.default = commentRoutes;