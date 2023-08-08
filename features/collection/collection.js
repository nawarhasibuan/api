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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const collectionSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    posts: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        default: [],
    },
    tags: {
        type: [{ type: String, lowercase: true }],
        default: [],
    },
    comments: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        default: [],
    },
});
collectionSchema.methods.data = function () {
    return {
        id: this.id,
        name: this.name,
        author: this.author,
        tags: this.tags,
        description: this.description,
        comments: this.comments,
    };
};
const Collection = mongoose_1.default.model("Collection", collectionSchema);
exports.default = Collection;
