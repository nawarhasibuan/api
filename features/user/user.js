"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: function () {
            return !this.email;
        },
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
        type: String,
        validate: {
            validator: function (email) {
                return zod_1.z.string().email().safeParse(email).success;
            },
        },
        required: function () {
            return !!this.role;
        },
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true },
    avatar: {
        type: String,
        required: function () {
            return !!this.role;
        },
        validate: {
            validator: function (url) {
                return zod_1.z.string().url().safeParse(url).success;
            },
        },
    },
    dob: {
        type: Date,
        required: function () {
            return !!this.role;
        },
        validate: {
            validator: function (dob) {
                return zod_1.z
                    .date()
                    .min(new Date("1900-01-01"))
                    .max(new Date())
                    .safeParse(dob).success;
            },
        },
    },
    phone: {
        type: String,
        validate: {
            validator: function (p) {
                return /^(((\+)?62[\s-]?)|0)?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/.test(p);
            },
        },
        required: function () {
            return !!this.role;
        },
    },
    address: {
        type: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            _id: false,
        },
        required: function () {
            return !!this.role;
        },
    },
    role: {
        type: String,
        enum: ["super", "admin"],
    },
});
userSchema.methods.data = function () {
    return {
        firstName: this === null || this === void 0 ? void 0 : this.firstName,
        lastName: this.lastName,
        avatar: this.avatar,
        dob: this.dob,
        phone: this.phone,
        address: this.address,
    };
};
userSchema.statics.isUserExist = function (email, username) {
    return this.findOne({
        $or: [
            { $and: [{ username: { $exists: true } }, { username: username }] },
            { $and: [{ email: { $exists: true } }, { email: email }] },
        ],
    }).exec();
};
userSchema.index({ username: 1, email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
