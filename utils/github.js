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
Object.defineProperty(exports, "__esModule", { value: true });
exports.putContent = exports.getContent = exports.getSha = void 0;
const octokit_1 = require("octokit");
const octokit = new octokit_1.Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "api.panggoaran/v1.0.0",
    timeZone: "Asia/Jakarta",
});
const getSha = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield octokit.request(`GET /repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}.md`, {
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                accept: "application/vnd.github+json",
            },
        });
        return result.data.sha;
    }
    catch (error) {
        return undefined;
    }
});
exports.getSha = getSha;
const getContent = (path) => {
    return octokit.request(`GET /repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}.md`, {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path,
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
            accept: "application/vnd.github.raw",
        },
    });
};
exports.getContent = getContent;
const putContent = (path, content) => __awaiter(void 0, void 0, void 0, function* () {
    const sha = yield (0, exports.getSha)(path);
    return yield octokit.request(`PUT /repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}.md`, {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path,
        message: `${sha ? "edit" : "add"} ${path} file`,
        content: Buffer.from(content).toString("base64"),
        sha,
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
});
exports.putContent = putContent;
