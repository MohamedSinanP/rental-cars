"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_error_js_1 = require("../utils/http.error.js");
const http_response_js_1 = require("../utils/http.response.js");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof http_error_js_1.HttpError) {
        return res.status(err.statusCode).json(http_response_js_1.HttpResponse.error(err.message, err.statusCode, err.errors));
    }
    res.status(500).json(http_response_js_1.HttpResponse.error("Something went wrong"));
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map