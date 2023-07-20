"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatInput = exports.relation = void 0;
const zod_1 = require("zod");
exports.relation = [
    "child",
    "cousin",
    "grand child",
    "grand parent",
    "great grand child",
    "great grand parent",
    "liberator",
    "parent",
    "nephew",
    "nephew father",
    "none",
    "other",
    "sibling",
    "sibling father",
    "sibling mother",
    "uncle",
    "uncle father",
];
const SInput = zod_1.z.object({
    deceased: zod_1.z.object({
        name: zod_1.z.string().optional(),
        gender: zod_1.z.boolean(),
        state: zod_1.z.number().optional(),
    }),
    heirs: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().optional(),
        gender: zod_1.z.boolean(),
        relation: zod_1.z.enum(exports.relation),
        partner: zod_1.z.boolean(),
    })),
});
const validatInput = (req, res, next) => {
    const input = req.body;
    const inputData = SInput.safeParse(input);
    if (inputData.success) {
        res.locals.data = inputData.data;
        next();
    }
    else {
        next(inputData.error);
    }
};
exports.validatInput = validatInput;
