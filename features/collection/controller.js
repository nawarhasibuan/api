"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCollection = exports.deleteCollection = exports.getCollectionById = exports.createCollection = exports.getCollections = void 0;
const mongoose_1 = require("mongoose");
const collection_1 = __importDefault(require("./collection"));
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const comment_1 = __importDefault(require("../comment/comment"));
const post_1 = __importDefault(require("../post/post"));
const getCollections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield collection_1.default.find(res.locals.query, null, res.locals.options);
        res
            .status(200)
            .json(new ResponseData_1.default("Daftar serial", results)
            .addLink(Math.floor(res.locals.page), "/collection", res.locals.url)
            .toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getCollections = getCollections;
const createCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = res.locals.data;
        const author = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const newCollection = new collection_1.default(Object.assign(Object.assign({}, data), { author }));
        yield newCollection.save();
        res.status(201).json(new ResponseData_1.default("Serial dibuat").toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.createCollection = createCollection;
const getCollectionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = res.locals.id;
        const collection = yield collection_1.default.findById(id).populate("posts").lean();
        if (!collection) {
            throw new CustomError_1.default("collection tidak ditemukan", 404);
        }
        res
            .status(200)
            .json(new ResponseData_1.default("konten series", collection).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.getCollectionById = getCollectionById;
const deleteCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const colectionId = res.locals.id;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const colection = yield collection_1.default.findByIdAndDelete(colectionId).lean();
        if (!colection) {
            throw new CustomError_1.default("Not found", 404);
        }
        const comments = yield comment_1.default.find({
            _id: {
                $in: colection.comments,
            },
        }).lean();
        yield comment_1.default.deleteMany({
            _id: {
                $in: comments.flatMap((obj) => [obj._id, ...obj.replies]),
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
exports.deleteCollection = deleteCollection;
const editCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const seriesId = res.locals.id;
    const ids = res.locals.data;
    try {
        const collection = yield collection_1.default.findById(seriesId);
        if (!collection) {
            throw new CustomError_1.default("serial tidak ditemukan", 404);
        }
        const promises = ids.map((id) => {
            return post_1.default.findById(id).lean();
        });
        const posts = yield Promise.allSettled(promises);
        posts.forEach((post) => {
            if (post.status === "fulfilled" && post.value) {
                const index = collection === null || collection === void 0 ? void 0 : collection.posts.indexOf(post.value._id);
                if (index > -1) {
                    collection === null || collection === void 0 ? void 0 : collection.posts.splice(index, 1);
                }
                else {
                    collection === null || collection === void 0 ? void 0 : collection.posts.push(post.value._id);
                }
            }
        });
        yield collection.save();
        res
            .status(201)
            .json(new ResponseData_1.default("Series diedit", collection).toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.editCollection = editCollection;
