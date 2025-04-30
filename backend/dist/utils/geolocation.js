"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAddressFromCoordinates = void 0;
const axios_1 = __importDefault(require("axios"));
const http_error_js_1 = require("./http.error.js");
const fetchAddressFromCoordinates = async (lng, lat) => {
    try {
        const response = await axios_1.default.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                lat,
                lon: lng,
                format: "json",
            },
            headers: {
                "User-Agent": "YourAppName/1.0 (your@email.com)",
            },
        });
        if (!response.data?.display_name) {
            throw new http_error_js_1.HttpError(404, "No address found.");
        }
        return response.data.display_name;
    }
    catch (error) {
        console.error("Error calling OpenStreetMap:", error);
        throw new http_error_js_1.HttpError(404, "Unable to fetch address from coordinates.");
    }
};
exports.fetchAddressFromCoordinates = fetchAddressFromCoordinates;
//# sourceMappingURL=geolocation.js.map