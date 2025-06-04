"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
;
const adminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true });
exports.Admin = (0, mongoose_1.model)("Admin", adminSchema, "admin");
