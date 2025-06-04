"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_error_1 = require("../utils/http.error");
const http_response_1 = require("../utils/http.response");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof http_error_1.HttpError) {
        return res.status(err.statusCode).json(http_response_1.HttpResponse.error(err.message, err.statusCode, err.errors));
    }
    res.status(500).json(http_response_1.HttpResponse.error("Something went wrong"));
};
exports.errorHandler = errorHandler;
