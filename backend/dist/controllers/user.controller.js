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
const types_js_1 = require("../types/types.js");
const types_js_2 = __importDefault(require("../di/types.js"));
const http_response_js_1 = require("../utils/http.response.js");
let UserConroller = class UserConroller {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    ;
    async fetchUser(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            if (userId) {
                const userDetails = await this.userService.fetchUser(userId);
                res.status(types_js_1.StatusCode.OK).json(http_response_js_1.HttpResponse.success(userDetails));
            }
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fetchUserLocationAddress(req, res, next) {
        try {
            const { lng, lat } = req.query;
            const address = await this.userService.fetchUserLocationAddresss(Number(lng), Number(lat));
            res.status(types_js_1.StatusCode.OK).json(http_response_js_1.HttpResponse.success(address));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async setUserLocation(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            const { location } = req.body;
            const updatedUser = await this.userService.setUserLocation(userId, location);
            res.status(types_js_1.StatusCode.OK).json(http_response_js_1.HttpResponse.success(updatedUser));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
UserConroller = __decorate([
    __param(0, (0, inversify_1.inject)(types_js_2.default.IUserService)),
    __metadata("design:paramtypes", [Object])
], UserConroller);
exports.default = UserConroller;
;
//# sourceMappingURL=user.controller.js.map