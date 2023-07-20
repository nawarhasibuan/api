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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCase = exports.getSaham = exports.getRelation = void 0;
const ResponseData_1 = __importDefault(require("../../utils/ResponseData"));
const CustomError_1 = __importDefault(require("../../utils/CustomError"));
const waris_calculator_1 = __importStar(require("waris-calculator"));
const validation_1 = require("./validation");
const waris_1 = __importDefault(require("./waris"));
const getRelation = (req, res, next) => {
    res
        .status(200)
        .json(new ResponseData_1.default("Daftar hubungan keluarga yang valid", validation_1.relation).toJSON());
};
exports.getRelation = getRelation;
const getSaham = (req, res, next) => {
    const data = res.locals.data;
    const calc = (0, waris_calculator_1.default)((0, waris_calculator_1.deceased)(data.deceased));
    try {
        data.heirs.forEach((h) => {
            calc.push((0, waris_calculator_1.heir)(Object.assign(Object.assign({}, h), { isPartner: h.partner })));
        });
        const calculation = calc.calculation;
        let result = [];
        const relList = [
            ["anak laki-laki", "cucu laki-laki", "cicit laki-laki"],
            ["ayah", "kakek", "kakek buyut"],
            [
                "saudara",
                "saudara seayah",
                "saudara seibu",
                "keponakan",
                "keponakan seayah",
            ],
            ["paman", "paman seayah", "sepupu"],
            ["anak perempuan", "cucu perempuan", "cicit perempuan"],
            ["ibu", "nenek", "nenek buyut"],
            ["saudari", "saudari seayah", "saudara seibu"],
            ["dzawil arham", "memerdekakan", "", "pasangan"],
        ];
        calculation.forEach((val, idx) => {
            let i = calc.heir(idx).power > 3
                ? 7
                : calc.heir(idx).gender
                    ? calc.heir(idx).power
                    : calc.heir(idx).power + 4;
            let j = calc.heir(idx).darajah;
            let rel = "";
            if (calc.heir(idx).isPartner) {
                if (!calc.mahjub(idx)) {
                    rel += " " + relList[i][j];
                }
                rel = relList[7][3] + rel;
            }
            else {
                rel = relList[i][j];
            }
            const id = result.findIndex((r) => !r.relation.localeCompare(rel));
            if (id >= 0) {
                result[id].waris.push(calc.heir(idx).name || "");
            }
            else {
                result[result.length] = {
                    relation: rel,
                    furud: calc.share(idx),
                    siham: val.mul(calc.tashih).valueOf(),
                    waris: [calc.heir(idx).name || ""],
                };
            }
        });
        res.status(200).json(new ResponseData_1.default("Daftar bagian ahli waris", {
            bagian: result,
            asalMasalah: calc.baseProblem,
            tashih: calc.tashih,
            aul: calc.aul,
            radd: calc.radd,
        }).toJSON());
    }
    catch (err) {
        const error = new CustomError_1.default(err.message, 400);
        next(error);
    }
};
exports.getSaham = getSaham;
const saveCase = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = res.locals.data;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const doc = new waris_1.default(Object.assign(Object.assign({}, data), { author: id }));
        yield doc.save();
        res.status(201).json(new ResponseData_1.default("Disimpan").toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.saveCase = saveCase;
