"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const warisSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    deceased: {
        type: {
            name: String,
            gender: { type: Boolean, required: true },
            state: Number,
        },
    },
    heirs: {
        type: [
            {
                name: String,
                gender: { type: Boolean, required: true },
                relation: { type: String, required: true },
                partner: { type: Boolean, required: true },
            },
        ],
    },
});
warisSchema.index({ author: 1, deceased: 1 });
const Waris = (0, mongoose_1.model)("Waris", warisSchema);
exports.default = Waris;
