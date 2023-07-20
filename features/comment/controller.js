"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.getCommentById = exports.createComment = exports.getComments = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const comment_1 = __importDefault(require("../comment/comment"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const collection_1 = __importDefault(require("../collection/collection"));
const post_1 = __importDefault(require("../post/post"));
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = res.locals.data;
        if (!ids) {
            res.status(200).json(new ResponseData_1.default("Daftar komentar", []));
            return;
        }
        console.log(ids);
        const conditions = {};
        conditions._id = { $in: ids };
        const comments = (yield comment_1.default.find(conditions).lean()).map((values) => {
            const { __v } = values, data = __rest(values, ["__v"]);
            return data;
        });
        res
            .status(200)
            .json(new ResponseData_1.default("Daftar komentar", comments).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getComments = getComments;
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, parent, post, postId } = res.locals.data;
        const user = req.user;
        const newComment = new comment_1.default({
            content,
            author: user === null || user === void 0 ? void 0 : user.id,
            parent,
        });
        let parentC;
        if (parent) {
            parentC = yield comment_1.default.findById(parent);
            if (!parentC) {
                throw new CustomError_1.default("parent not found", 404).push({
                    field: "parent",
                    message: "tidak terdaftar",
                });
            }
            else {
                const session = yield (0, mongoose_1.startSession)();
                session.startTransaction();
                try {
                    parentC.replies.push(newComment.id);
                    yield Promise.all([newComment.save(), parentC.save()]);
                    yield session.commitTransaction();
                }
                catch (err) {
                    yield session.abortTransaction();
                    throw err;
                }
                finally {
                    yield session.endSession();
                }
            }
        }
        else {
            newComment.parent = undefined;
            const session = yield (0, mongoose_1.startSession)();
            session.startTransaction();
            try {
                let section;
                if (post === null || post === void 0 ? void 0 : post.localeCompare("post")) {
                    section = yield collection_1.default.findById(postId);
                }
                else {
                    section = yield post_1.default.findById(postId);
                }
                if (!section) {
                    throw new CustomError_1.default("Post tidak ditemukan", 400);
                }
                section.comments.push(newComment.id);
                yield Promise.all([section.save(), newComment.save()]);
                yield session.commitTransaction();
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        }
        res.status(201).json(new ResponseData_1.default("Comment dibuat").toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.createComment = createComment;
const getCommentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(commentId))
            throw new CustomError_1.default("id tidak valid", 400).push({
                field: "id",
                message: "bukan id",
            });
        const comment = yield comment_1.default.findById(commentId).lean();
        if (!comment) {
            throw new CustomError_1.default("Not found", 404);
        }
        const { __v } = comment, data = __rest(comment, ["__v"]);
        res.status(200).json(new ResponseData_1.default("sukses", data).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getCommentById = getCommentById;
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(commentId))
            throw new CustomError_1.default("id tidak valid", 400).push({
                field: "id",
                message: "bukan id",
            });
        const comment = yield comment_1.default.findById(commentId);
        if (!comment) {
            throw new CustomError_1.default("Not found", 404);
        }
        if (comment.parent) {
            const parent = yield comment_1.default.findById(comment.parent);
            const session = yield (0, mongoose_1.startSession)();
            session.startTransaction();
            try {
                yield comment_1.default.deleteOne({ id: comment.id }).lean();
                parent === null || parent === void 0 ? void 0 : parent.replies.filter((id) => id !== comment.id);
                yield (parent === null || parent === void 0 ? void 0 : parent.save());
                yield session.commitTransaction();
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        }
        else {
            yield comment_1.default.deleteMany({
                $or: [{ _id: comment.id }, { _id: { $in: comment.replies } }],
            }).lean();
        }
        res.status(200).json(new ResponseData_1.default("Comment berhasil dihapus").toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.deleteComment = deleteComment;
