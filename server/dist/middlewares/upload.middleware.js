"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsDocs = exports.uploads = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
const docFileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";
    if (!isImage && !isPdf) {
        return cb(new Error("Only image or PDF files are allowed!"));
    }
    cb(null, true);
};
const docUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: docFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
exports.uploads = {
    single: (fieldName) => upload.single(fieldName),
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fieldsArray) => upload.fields(fieldsArray),
};
exports.uploadsDocs = {
    single: (fieldName) => docUpload.single(fieldName),
    array: (fieldName, maxCount) => docUpload.array(fieldName, maxCount),
    fields: (fieldsArray) => docUpload.fields(fieldsArray),
};
