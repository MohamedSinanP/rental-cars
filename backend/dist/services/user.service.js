"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_js_1 = __importDefault(require("../di/types.js"));
const http_error_js_1 = require("../utils/http.error.js");
const types_js_2 = require("../types/types.js");
const geolocation_js_1 = require("../utils/geolocation.js");
let UserService = class UserService {
    _userRepository;
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    ;
    async fetchUser(userId) {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.UNAUTHORIZED, "User not found");
        }
        ;
        return {
            userName: user.userName,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified
        };
    }
    ;
    async fetchAllUsers(page, limit) {
        const { data, total } = await this._userRepository.findPaginated(page, limit);
        if (!data) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.UNAUTHORIZED, "User not found");
        }
        ;
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page,
        };
    }
    ;
    async fetchUserLocationAddresss(lng, lat) {
        const address = await (0, geolocation_js_1.fetchAddressFromCoordinates)(lng, lat);
        return address;
    }
    async setUserLocation(userId, location) {
        const updatedUser = await this._userRepository.update(userId, { location: location });
        if (!updatedUser) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update user");
        }
        ;
        return {
            userName: updatedUser.userName,
            email: updatedUser.email,
            isBlocked: updatedUser.isBlocked,
            isVerified: updatedUser.isVerified,
            location: updatedUser.location
        };
    }
    ;
    async getUserLocation(userId) {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't find user");
        }
        if (!user.location || !Array.isArray(user.location.coordinates)) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "User location is not set properly");
        }
        return user.location.coordinates;
    }
    ;
    async blockOrUnblockUser(userId) {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't find user");
        }
        const updatedUser = await this._userRepository.update(userId, {
            isBlocked: !user.isBlocked,
        });
        if (!updatedUser) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.INTERNAL_SERVER_ERROR, "Failed to block user");
        }
        return updatedUser;
    }
    ;
};
UserService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IUserRepository)),
    __metadata("design:paramtypes", [Object])
], UserService);
exports.default = UserService;
;
//# sourceMappingURL=user.service.js.map