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
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const types_2 = __importDefault(require("../di/types"));
const http_response_1 = require("../utils/http.response");
let UserConroller = class UserConroller {
    constructor(_userService) {
        this._userService = _userService;
    }
    ;
    fetchUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                if (userId) {
                    const userDetails = yield this._userService.fetchUser(userId);
                    res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(userDetails));
                }
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getUserDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const userDetails = yield this._userService.getUserDetails(userId);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(userDetails));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchUserLocationAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lng, lat } = req.query;
                const address = yield this._userService.fetchUserLocationAddresss(Number(lng), Number(lat));
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(address));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    setUserLocation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { location } = req.body;
                const updatedUser = yield this._userService.setUserLocation(userId, location);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedUser));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchUserAddresses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const addresses = yield this._userService.getUserAddresses(userId);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(addresses));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getUserWallet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const wallet = yield this._userService.getUserWallet(userId);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(wallet));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const { userName, email } = req.body;
                const updatedUser = yield this._userService.updateUser(userId, userName, email);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedUser, "Your profile details changed"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const { currentPwd, newPwd } = req.body;
                yield this._userService.updatePassword(userId, currentPwd, newPwd);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success({}, "Your password updated successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    uploadImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const { profilePic } = req.body;
                const imageUrl = yield this._userService.updateProfilePic(userId, profilePic);
                res.status(types_1.StatusCode.OK).json(http_response_1.HttpResponse.success(imageUrl, "Your profile pic updated successfully"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
};
UserConroller = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_2.default.IUserService)),
    __metadata("design:paramtypes", [Object])
], UserConroller);
exports.default = UserConroller;
;
