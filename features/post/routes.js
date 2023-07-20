"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middlewares/auth");
const authorizeSuper_1 = require("../../middlewares/authorizeSuper");
const validation_1 = require("./validation");
const postRoutes = (0, express_1.Router)();
postRoutes.get("/", validation_1.validateOpt, controller_1.getArticles);
postRoutes.put("/", auth_1.auth, authorizeSuper_1.authorizeSuper, validation_1.validatePost, controller_1.putPost);
postRoutes.put("/db", auth_1.auth, authorizeSuper_1.authorizeSuper, validation_1.validatePost, controller_1.putDb);
postRoutes.put("/github", auth_1.auth, authorizeSuper_1.authorizeSuper, validation_1.validatePost, controller_1.putGithub);
postRoutes.get("/:id", controller_1.getPostById);
postRoutes.delete("/:id", auth_1.auth, authorizeSuper_1.authorizeSuper, controller_1.deletePost);
exports.default = postRoutes;
