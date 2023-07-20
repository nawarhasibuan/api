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
exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = exports.editProfile = exports.getProfile = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("./user"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const zod_1 = require("zod");
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            throw new Error("User not found");
        }
        const data = {
            firstName: user === null || user === void 0 ? void 0 : user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            dob: user.dob,
            phone: user.phone,
            address: user.address,
        };
        res.status(200).json({ data, message: "User profile" });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const editProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { email, firstName, lastName, avatar, dob, phone, address } = res.locals
            .data;
        console.log(address);
        const user = yield user_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!user.email && email)
            user.email = email;
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (avatar)
            user.avatar = avatar;
        if (dob)
            user.dob = new Date(dob);
        if (phone)
            user.phone = phone;
        if (address)
            user.address = Object.assign(Object.assign({}, address), { zip: address.zip.toString() });
        const updatedUser = yield user.save();
        const data = updatedUser.data();
        res.json({ message: "Profile updated", data });
    }
    catch (error) {
        next(error);
    }
});
exports.editProfile = editProfile;
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = res.locals.data;
        const user = yield user_1.default.isUserExist(userData.username, userData.email);
        if (user) {
            throw new CustomError_1.default("User sudah terdaftar, silahkan login", 400);
        }
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
        const newUser = new user_1.default(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
        const savedUser = yield newUser.save();
        const payload = {
            id: newUser.id,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_REFRESH, {
            expiresIn: "24h",
        });
        const data = new ResponseData_1.default("User berhasil ditambahkan", {
            token,
            refreshToken,
            user: newUser.data(),
        });
        res.status(201).json(data.toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = res.locals.data;
        const user = yield user_1.default.isUserExist(email, username);
        if (!user) {
            throw new CustomError_1.default("Username atau email tidak terdaftar", 404).push({
                field: "emailOrUsername",
                message: "Tidak ditemukan",
            });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CustomError_1.default("Password salah", 400).push({
                field: "password",
                message: "Tidak sesuai",
            });
        }
        const payload = {
            id: user.id,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_REFRESH, {
            expiresIn: "24h",
        });
        const data = new ResponseData_1.default("User berhasil login", {
            token,
            refreshToken,
            user: user.data(),
        });
        res.status(201).json(data.toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const valid = zod_1.z.string().email().safeParse(email);
        if (!valid.success) {
            throw new CustomError_1.default("email tidak valid");
        }
        const user = yield user_1.default.findOne({ email: valid.data });
        if (!user) {
            throw new CustomError_1.default("User tidak ditemukan", 404);
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: "1h" });
        res.json({ resetToken, message: "Password reset token sent to your email" });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;
        const decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_RESET_SECRET);
        const { userId } = decoded;
        const user = yield user_1.default.findById(userId);
        if (!user) {
            throw new CustomError_1.default("User tidak ditemukan", 404);
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        user.password = hashedPassword;
        const updatedUser = yield user.save();
        const payload = {
            id: updatedUser.id,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_REFRESH, {
            expiresIn: "24h",
        });
        const data = new ResponseData_1.default("Password berhasil direset", {
            token,
            refreshToken,
            user: updatedUser.data(),
        });
        res.status(201).json(data.toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
