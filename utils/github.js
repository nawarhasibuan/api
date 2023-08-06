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
exports.getContent = exports.putContent = void 0;
const octokit_1 = require("octokit");
function getSHAOfFile(octokit, path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield octokit.request(`GET /repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`);
            return data.sha;
        }
        catch (error) {
            if (error.status === 404) {
                return undefined;
            }
            throw error;
        }
    });
}
function putContent(path, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new octokit_1.Octokit({
            auth: process.env.GITHUB_TOKEN,
            userAgent: "api.panggoaran/v1.0.0",
            timeZone: "Asia/Jakarta",
        });
        try {
            const sha = yield getSHAOfFile(octokit, path);
            return yield octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: process.env.GITHUB_OWNER || "",
                repo: process.env.GITHUB_REPO || "",
                path,
                message: `${sha ? "edit" : "add"} ${path} file`,
                content: Buffer.from(content).toString("base64"),
                sha,
                headers: {
                    accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.putContent = putContent;
function getContent(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new octokit_1.Octokit({
            auth: process.env.GITHUB_TOKEN,
            userAgent: "api.panggoaran/v1.0.0",
            timeZone: "Asia/Jakarta",
        });
        try {
            const { data } = yield octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                owner: process.env.GITHUB_OWNER || "",
                repo: process.env.GITHUB_REPO || "",
                path,
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28",
                    accept: "application/vnd.github.raw",
                },
            });
            return data;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getContent = getContent;
