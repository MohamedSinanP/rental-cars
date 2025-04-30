"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponse = void 0;
class HttpResponse {
    static success(data, message = "Success", statusCode = 200) {
        return {
            success: true,
            statusCode,
            message,
            data,
        };
    }
    ;
    static created(data, message = "Resource created successfully") {
        return {
            success: true,
            statusCode: 201,
            message,
            data,
        };
    }
    ;
    static error(message, statusCode = 500, errors) {
        return {
            success: false,
            statusCode,
            message,
            errors,
        };
    }
    ;
    static badRequest(message, errors) {
        return this.error(message, 400, errors);
    }
    ;
    static unauthorized(message = "Unauthorized access") {
        return this.error(message, 401);
    }
    ;
    static forbidden(message = "Forbidden access") {
        return this.error(message, 403);
    }
    ;
    static notFound(message = "Resource not found") {
        return this.error(message, 404);
    }
    ;
    static serverError(message = "Internal Server Error") {
        return this.error(message, 500);
    }
    ;
}
exports.HttpResponse = HttpResponse;
;
//# sourceMappingURL=http.response.js.map