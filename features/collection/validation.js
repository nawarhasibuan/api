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
exports.validateOpt = exports.validateId = exports.validateAdd = exports.validateColl = exports.SOptions = exports.SColl = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
exports.SColl = zod_1.z.object({
    name: zod_1.z.string({
        required_error: "nama harus ada",
        invalid_type_error: "nama harus string",
    }),
    description: zod_1.z.string({
        invalid_type_error: "deskripsi harus string",
    }),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const SOpt = zod_1.z
    .object({
    tags: zod_1.z.string(),
    search: zod_1.z.string(),
    author: zod_1.z.string().refine((arg) => mongoose_1.default.isValidObjectId(arg)),
    page: zod_1.z.string().regex(/^[1-9][0-9]*$/, "page dalam numeric string"),
    show: zod_1.z.string().regex(/^[1-9][0-9]*$/, "show dalam numeric string"),
})
    .partial();
exports.SOptions = zod_1.z.object({
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.string().optional(),
    type: zod_1.z.enum(["article", "exercise"]).optional(),
    author: zod_1.z.string().refine((arg) => mongoose_1.default.isValidObjectId(arg)),
    page: zod_1.z.number(),
    show: zod_1.z.number(),
});
const validateColl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const collInput = exports.SColl.safeParse(req.body);
    if (collInput.success) {
        res.locals.data = collInput.data;
        next();
    }
    else {
        next(collInput.error);
    }
});
exports.validateColl = validateColl;
const validateAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataId = zod_1.z
        .array(zod_1.z.string().refine((arg) => mongoose_1.default.isValidObjectId(arg)))
        .safeParse(req.body.ids);
    if (dataId.success) {
        res.locals.data = dataId.data;
        next();
    }
    else {
        next(dataId.error);
    }
});
exports.validateAdd = validateAdd;
const validateId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataId = zod_1.z
        .string()
        .refine((arg) => mongoose_1.default.isValidObjectId(arg))
        .safeParse(req.params.id);
    if (dataId.success) {
        res.locals.id = dataId.data;
        next();
    }
    else {
        next(dataId.error);
    }
});
exports.validateId = validateId;
const validateOpt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const opt = SOpt.safeParse(req.query);
    if (opt.success) {
        const page = +(opt.data.page || 1);
        const show = +(opt.data.show || 20);
        const tags = (_a = opt.data.tags) === null || _a === void 0 ? void 0 : _a.split("-");
        const url = `&show=${show}${opt.data.tags ? `&tags=${opt.data.tags}` : ""}${opt.data.search ? `&search=${opt.data.search}` : ""}${opt.data.author ? `&author=${opt.data.author}` : ""}`;
        res.locals.url = url;
        let query = {};
        if (opt.data.search)
            query.name = {
                $regex: opt.data.search,
                $options: "i",
            };
        if (opt.data.author)
            query.author = opt.data.author;
        if (tags)
            query.tags = { $in: tags };
        const options = {
            skip: (page - 1) * show,
            limit: show,
            sort: { views: -1, likes: -1 },
            select: { __v: 0 },
            populate: { path: "author", select: "firstName lastName avatar" },
        };
        res.locals.options = options;
        res.locals.query = query;
        res.locals.page = page;
        res.locals.show = show;
        next();
    }
    else {
        next(opt.error);
    }
});
exports.validateOpt = validateOpt;
