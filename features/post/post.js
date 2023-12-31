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
const blogPostSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    path: { type: String, required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    summary: { type: String },
    score: Number,
    tags: [{ type: String, lowercase: true }],
    type: { type: String, required: true, enum: ["exercise", "article"] },
    metaData: {
        views: [{ type: String }],
        likes: [{ type: mongoose_1.Schema.Types.ObjectId }],
        _id: false,
    },
    comments: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
        default: [],
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
blogPostSchema.virtual("meta").get(function () {
    return { views: this.metaData.views.length, likes: this.metaData.likes.length };
});
blogPostSchema.methods.data = function () {
    return {
        id: this.id,
        title: this.title,
        author: this.author,
        summary: this.summary,
        tags: this.tags,
        type: this.type,
        meta: this.meta,
        comments: this.comments,
        createdAt: this.createdAt,
    };
};
blogPostSchema.index({ author: 1, type: 1 });
blogPostSchema.index({ path: 1, title: 1 }, { unique: true });
const Post = mongoose_1.default.model("Post", blogPostSchema);
exports.default = Post;
