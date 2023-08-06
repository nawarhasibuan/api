"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubPath = void 0;
const githubPath = (path, title) => {
    const newPath = path
        .trim()
        .toLowerCase()
        .replace(/([^\/])$/, "$1/");
    const newTitle = title.trim().toLowerCase().split(" ").join("-");
    return newPath.concat(newTitle, ".md");
};
exports.githubPath = githubPath;
