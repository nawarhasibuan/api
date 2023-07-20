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
exports.deletePost = exports.getPostById = exports.putGithub = exports.putDb = exports.putPost = exports.getArticles = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const post_1 = __importDefault(require("./post"));
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const comment_1 = __importDefault(require("../comment/comment"));
const github_1 = require("../../utils/github");
const getArticles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield post_1.default.find(res.locals.query, null, res.locals.options);
        res
            .status(200)
            .json(new ResponseData_1.default("Daftar artikel", results)
            .addLink(Math.floor(res.locals.page), "/post", res.locals.url)
            .toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getArticles = getArticles;
const putPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = res.locals.data, { path } = _a, data = __rest(_a, ["path"]);
        let post = yield post_1.default.findOne({ path });
        const content = res.locals.content;
        const user = req.user;
        if (!post) {
            post = new post_1.default(Object.assign({ author: user === null || user === void 0 ? void 0 : user.id, path }, data));
        }
        else {
            post.type = data.type;
            post.title = data.title;
            post.summary = data.summary;
            post.tags = data.tags || post.tags;
        }
        const db = post.save();
        const github = (0, github_1.putContent)(path, content);
        const result = yield Promise.allSettled([github, db]);
        let message = "";
        let links = [];
        if (result[0].status === "rejected" && result[1].status === "rejected") {
            throw new CustomError_1.default("gagal menyimpan artikel", 500);
        }
        if (result[0].status === "rejected" || result[0].value.status >= 400) {
            message.concat("gagal meyimpan ke github");
            links.push("/blog/gihub");
        }
        if (result[1].status === "rejected") {
            message.concat("gagal menyimpan ke db");
            links.push("/blog/db");
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
        const _b = res.locals.data, { path } = _b, data = __rest(_b, ["path"]);
        const user = req.user;
        let post = yield post_1.default.findOne({ path });
        if (!post) {
            post = new post_1.default(Object.assign({ author: user === null || user === void 0 ? void 0 : user.id, path }, data));
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
const putGithub = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { path } = res.locals.data;
        const content = res.locals.content;
        const github = yield (0, github_1.putContent)(path, content);
        if (github.status < 400) {
            res
                .status(201)
                .json(new ResponseData_1.default("Blog tersimpan ke github", { path }).toJSON());
        }
        else {
            res.status(500).json({ message: "gagal menyimpan, internal error" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.putGithub = putGithub;
const getPostById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(articleId))
            throw new CustomError_1.default("id tida valid", 400);
        const article = yield post_1.default.findByIdAndUpdate(articleId, {
            $inc: { "meta.views": 1 },
        }, { returnOriginal: false }).lean();
        if (!article) {
            throw new CustomError_1.default("Not found in db:", 404);
        }
        const { __v } = article, data = __rest(article, ["__v"]);
        const content = yield (0, github_1.getContent)(article.path);
        res.status(200).json(new ResponseData_1.default("sukses", {
            content: content.data,
            comments: article.comments,
            meta: article.meta,
        }).toJSON());
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
