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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAddressFromCoordinates = void 0;
const axios_1 = __importDefault(require("axios"));
const http_error_1 = require("./http.error");
const fetchAddressFromCoordinates = (lng, lat) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                lat,
                lon: lng,
                format: "json",
            },
            headers: {
                "User-Agent": "YourAppName/1.0 (your@email.com)",
            },
        });
        if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.display_name)) {
            throw new http_error_1.HttpError(404, "No address found.");
        }
        return response.data.display_name;
    }
    catch (error) {
        console.error("Error calling OpenStreetMap:", error);
        throw new http_error_1.HttpError(404, "Unable to fetch address from coordinates.");
    }
});
exports.fetchAddressFromCoordinates = fetchAddressFromCoordinates;
