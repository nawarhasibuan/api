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
exports.validatePost = exports.validateOpt = exports.SOptions = exports.FrontMatter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const gray_matter_1 = __importDefault(require("gray-matter"));
const user_1 = __importDefault(require("../user/user"));
exports.FrontMatter = zod_1.z
    .object({
    path: zod_1.z
        .string({
        required_error: "path harus ada",
        invalid_type_error: "path harus string",
    })
        .refine((v) => {
        return (/(^opini|^travel|^waris)\/[\w-]+$/.test(v) ||
            /^\bpembelajaran\b\/(\binformatika\b|\bmatematika\b)\/[\w+-]+\/[\w+-]+$/.test(v) ||
            /^\bsoal\b\/(\baljabar\b|\baritmatika\b|\bkombinatorika\b|\bpemrograman\b|\geometri\b)\/[\w+-]+$/.test(v) ||
            /^\bsoal\b\/\bosn\b\/(\binformatika\b|\bmatematika\b)\/\d{4}\/os[kpn]-[a-z]?\d{0,1}?-?\d{1,2}$/.test(v));
    }),
    summary: zod_1.z
        .string({
        invalid_type_error: "summary harus string",
    })
        .optional(),
    type: zod_1.z.enum(["article", "exercise"], {
        invalid_type_error: "hanya article atau exercise",
        required_error: "tipe post harus disediakan",
    }),
    title: zod_1.z.string({
        required_error: "sertakan title",
    }),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    score: zod_1.z.number().optional(),
})
    .refine((fm) => (fm.type === "article" &&
    fm.summary != undefined &&
    fm.score === undefined) ||
    (fm.type === "exercise" &&
        fm.summary === undefined &&
        fm.score !== undefined), "summary atau score harus ada sesuai type");
const SOpt = zod_1.z
    .object({
    categories: zod_1.z.string(),
    tags: zod_1.z.string(),
    search: zod_1.z.string(),
    type: zod_1.z.enum(["article", "exercise"]),
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
const validateOpt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const opt = SOpt.safeParse(req.query);
    if (opt.success) {
        const page = +(opt.data.page || 1);
        const show = +(opt.data.show || 20);
        const tags = (_a = opt.data.tags) === null || _a === void 0 ? void 0 : _a.split("-");
        const categories = (_b = opt.data.categories) === null || _b === void 0 ? void 0 : _b.split("-");
        const url = `&show=${show}${opt.data.tags ? `&tags=${opt.data.tags}` : ""}${opt.data.search ? `&search=${opt.data.search}` : ""}${opt.data.type ? `&type=${opt.data.type}` : ""}${opt.data.author ? `&author=${opt.data.author}` : ""}${opt.data.categories ? `&categories=${opt.data.categories}` : ""}`;
        res.locals.url = url;
        let query = {};
        if (opt.data.search)
            query.title = {
                $regex: opt.data.search,
                $options: "i",
            };
        if (opt.data.type)
            query.type = opt.data.type;
        if (opt.data.author)
            query.author = opt.data.author;
        if (tags)
            query.tags = { $in: tags };
        if (categories)
            query.path = {
                $regex: categories.join("|"),
                $options: "i",
            };
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
const validatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { content } = req.body;
    const blogData = zod_1.z
        .string({
        required_error: "harus ada content",
        invalid_type_error: "content harus bentuk string",
    })
        .safeParse(content);
    if (blogData.success) {
        try {
            const markdown = (0, gray_matter_1.default)(blogData.data);
            const frontMatter = exports.FrontMatter.safeParse(markdown.data);
            if (frontMatter.success) {
                res.locals.data = frontMatter.data;
                const author = yield user_1.default.findById((_c = req.user) === null || _c === void 0 ? void 0 : _c.id)
                    .select("firstName lastName")
                    .lean();
                const _e = frontMatter.data, { path, summary } = _e, withoutPath = __rest(_e, ["path", "summary"]);
                const front = Object.assign(Object.assign({}, withoutPath), { author: {
                        id: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
                        name: `${author === null || author === void 0 ? void 0 : author.firstName} ${(author === null || author === void 0 ? void 0 : author.lastName) || ""}`,
                    }, date: new Date().toDateString() });
                res.locals.content = gray_matter_1.default.stringify(markdown.content, front);
                next();
            }
            else {
                next(frontMatter.error);
            }
        }
        catch (error) {
            next(error);
        }
    }
    else {
        next(blogData.error);
    }
});
exports.validatePost = validatePost;
