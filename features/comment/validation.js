"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIds = exports.validateCreate = exports.SIds = exports.SComment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
exports.SComment = zod_1.z.object({
    content: zod_1.z.string({
        required_error: "content harus ada",
        invalid_type_error: "content harus string",
    }),
    parent: zod_1.z
        .string({
        invalid_type_error: "harus string",
    })
        .refine((arg) => mongoose_1.default.isValidObjectId(arg), "parent comment tidak valid")
        .optional(),
    post: zod_1.z
        .enum(["post", "collection"], {
        invalid_type_error: "hanya post atau collection",
    })
        .optional(),
    postId: zod_1.z
        .string({
        required_error: "postId harus ada",
    })
        .refine((arg) => mongoose_1.default.isValidObjectId(arg), "postId tidak valid")
        .optional(),
});
exports.SIds = zod_1.z.array(zod_1.z.string().refine((arg) => mongoose_1.default.isValidObjectId(arg), "bukan id valid"));
const validateCreate = (req, res, next) => {
    const userInput = req.body;
    const userData = exports.SComment.safeParse(userInput);
    if (userData.success && (userData.data.parent || userData.data.postId)) {
        if (userData.data.postId && !userData.data.post) {
            next(new CustomError_1.default("parent atau (post dan postId) harus disertakan", 400));
        }
        else {
            res.locals.data = userData.data;
            next();
        }
    }
    else {
        next(userData.success
            ? new CustomError_1.default("parent atau postId harus disertakan", 400)
            : userData.error);
    }
};
exports.validateCreate = validateCreate;
const validateIds = (req, res, next) => {
    const ids = req.query.ids;
    const idsData = exports.SIds.safeParse(ids ? ids.split("-") : []);
    if (idsData.success) {
        res.locals.data = idsData.data;
        next();
    }
    else {
        next(idsData.error);
    }
};
exports.validateIds = validateIds;
