"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEdit = exports.validateLogin = exports.validateRegist = exports.SLogin = exports.SUser = void 0;
const zod_1 = require("zod");
exports.SUser = zod_1.z.object({
    username: zod_1.z
        .string()
        .toLowerCase()
        .min(3, "terlalu pendek")
        .max(20, "terlalu panjang"),
    email: zod_1.z.string().email("email tidak valid").optional(),
    password: zod_1.z.string().min(8, "minimal 8 karakter"),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional(),
    dob: zod_1.z.string().datetime().optional(),
    phone: zod_1.z
        .string()
        .regex(/^(((\+)?62[\s-]?)|0)?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/, "bukan nomor hp indonesia")
        .optional(),
    address: zod_1.z
        .object({
        street: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        zip: zod_1.z
            .string()
            .regex(/^\d{5}$/, "kode pos tidak valid")
            .or(zod_1.z.number().min(10000, "harus 5 digit").max(99999, "harus 5 digit")),
    })
        .optional(),
});
exports.SLogin = zod_1.z
    .object({
    username: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string(),
})
    .refine((v) => (v.username ? true : v.email), "username atau email harus ada");
const validateRegist = (req, res, next) => {
    const userInput = req.body;
    const userData = exports.SUser.safeParse(userInput);
    if (userData.success) {
        res.locals.data = userData.data;
        next();
    }
    else {
        next(userData.error);
    }
};
exports.validateRegist = validateRegist;
const validateLogin = (req, res, next) => {
    const loginInput = req.body;
    const loginData = exports.SLogin.safeParse(loginInput);
    if (loginData.success) {
        res.locals.data = loginData.data;
        next();
    }
    else {
        next(loginData.error);
    }
};
exports.validateLogin = validateLogin;
const validateEdit = (req, res, next) => {
    const editInput = req.body;
    const editData = exports.SUser.omit({
        username: true,
        password: true,
    }).safeParse(editInput);
    if (editData.success) {
        res.locals.data = editData.data;
        next();
    }
    else {
        next(editData.error);
    }
};
exports.validateEdit = validateEdit;
