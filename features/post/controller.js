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
exports.likePost = exports.deletePost = exports.getPostById = exports.putDb = exports.putPost = exports.getPosts = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const post_1 = __importDefault(require("./post"));
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const comment_1 = __importDefault(require("../comment/comment"));
const github_1 = require("../../utils/github");
const path_1 = require("../../utils/path");
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield post_1.default.find(res.locals.query, null, res.locals.options)
            .select({ comments: 0 })
            .populate("author", "id firstName lastName");
        res.status(200).json(new ResponseData_1.default("Daftar artikel", results.map((result) => {
            return result.data();
        }))
            .addLink(Math.floor(res.locals.page), "/post", res.locals.url)
            .toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getPosts = getPosts;
const putPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = res.locals.data, { id, path } = _a, data = __rest(_a, ["id", "path"]);
        let post = yield post_1.default.findOne({
            $or: [
                {
                    _id: id,
                },
                {
                    path,
                    title: data.title,
                },
            ],
        });
        const content = res.locals.content;
        const user = req.user;
        if (!post) {
            post = new post_1.default(Object.assign({ author: user === null || user === void 0 ? void 0 : user.id, path }, data));
        }
        else {
            post.type = data.type;
            post.summary = data.summary;
            post.score = data.score;
            post.tags = data.tags || post.tags;
        }
        const db = post.save();
        const github = (0, github_1.putContent)((0, path_1.githubPath)(post.path, data.title), content);
        const result = yield Promise.allSettled([github, db]);
        let message = "";
        let links = [];
        if (result[0].status === "rejected" && result[1].status === "rejected") {
            throw new CustomError_1.default("gagal menyimpan artikel", 500);
        }
        if (result[0].status === "rejected" || result[0].value.status >= 400) {
            message = message.concat("gagal meyimpan artikel");
            links.push("/post");
        }
        if (result[1].status === "rejected") {
            message = message.concat("gagal menyimpan ke db");
            links.push("/post/db");
        }
        res.status(201).json(Object.assign(Object.assign({}, new ResponseData_1.default(`Blog dibuat ${message}`, post.data()).toJSON()), { links }));
    }
    catch (error) {
        next(error);
    }
});
exports.putPost = putPost;
const putDb = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = res.locals.data, { id } = _b, data = __rest(_b, ["id"]);
        const user = req.user;
        let post = yield post_1.default.findById(id);
        if (!post) {
            post = new post_1.default(Object.assign({ author: user === null || user === void 0 ? void 0 : user.id }, data));
        }
        else {
            post.type = data.type;
            post.title = data.title;
            post.summary = data.summary;
            post.tags = data.tags || post.tags;
        }
        yield post.save();
        res
            .status(201)
            .json(new ResponseData_1.default("Blog tersimpan di database", post.data()).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.putDb = putDb;
const getPostById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(articleId))
            throw new CustomError_1.default("id tidak valid", 400);
        const article = yield post_1.default.findById(articleId).populate("author", "id firstName lastName");
        if (!article) {
            throw new CustomError_1.default("Not found", 404);
        }
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        if (ipAddress) {
            const idx = article.metaData.views.indexOf(ipAddress);
            if (idx === -1) {
                article.metaData.views.push(ipAddress);
                yield article.save();
            }
        }
        const content = yield (0, github_1.getContent)((0, path_1.githubPath)(article.path, article.title));
        res.status(200).json(new ResponseData_1.default("sukses", Object.assign(Object.assign({}, article.data()), { content })).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getPostById = getPostById;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articleId = req.params.id;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const article = yield post_1.default.findByIdAndDelete(articleId).lean();
        if (!article) {
            throw new CustomError_1.default("Not found", 404);
        }
        const comments = comment_1.default.find({
            _id: {
                $in: article.comments,
            },
        }).lean();
        yield comment_1.default.deleteMany({
            _id: {
                $in: (yield comments).flatMap((obj) => [obj._id, ...obj.replies]),
            },
        });
        yield session.commitTransaction();
        res.sendStatus(204);
    }
    catch (error) {
        yield session.abortTransaction();
        next(error);
    }
    finally {
        session.endSession();
    }
});
exports.deletePost = deletePost;
function likePost(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const postId = req.params.id;
        try {
            const post = yield post_1.default.findById(postId);
            if (!post) {
                throw new CustomError_1.default("not found", 404);
            }
            if (id) {
                const user = new mongoose_1.default.Types.ObjectId(id);
                const idx = post.metaData.likes.indexOf(user);
                if (idx > -1)
                    post.metaData.likes.splice(idx, 1);
                else
                    post.metaData.likes.push(user);
            }
            yield post.save();
            res.status(201).json(new ResponseData_1.default("liked"));
        }
        catch (error) {
            next(error);
        }
    });
}
exports.likePost = likePost;
