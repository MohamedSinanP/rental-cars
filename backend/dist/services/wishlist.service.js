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
const types_1 = __importDefault(require("../di/types"));
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
const helperFunctions_1 = require("../utils/helperFunctions");
let WishlistService = class WishlistService {
    constructor(_wishlistRepository) {
        this._wishlistRepository = _wishlistRepository;
    }
    addToWishlist(userId, carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wishlist = yield this._wishlistRepository.addCarToWishlist(userId, carId);
            if (!wishlist) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't add to wishlist.");
            }
            return (0, helperFunctions_1.toWishlistDTO)(wishlist);
        });
    }
    ;
    removeFromWishlist(userId, carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedWishlist = yield this._wishlistRepository.removeCarFromWishlist(userId, carId);
            if (!updatedWishlist) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't remove car from wishlist.");
            }
            return (0, helperFunctions_1.toWishlistDTO)(updatedWishlist);
        });
    }
    ;
    getWishlist(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wishlist = yield this._wishlistRepository.getWishlistByUserId(userId);
            if (!wishlist) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find your wishlist.");
            }
            return (0, helperFunctions_1.toWishlistDTO)(wishlist);
        });
    }
    ;
    getUserWishlist(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._wishlistRepository.findPaginated(userId, page, limit);
            if (!data || data.length === 0) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find your wishlist");
            }
            const totalPages = Math.ceil(total / limit);
            const mappedData = data.map(item => ({
                addedAt: item.addedAt,
                car: (0, helperFunctions_1.mapToCarDTO)(item.car),
            }));
            return {
                data: mappedData,
                totalPages,
                currentPage: page,
            };
        });
    }
};
WishlistService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IWishlistRepository)),
    __metadata("design:paramtypes", [Object])
], WishlistService);
exports.default = WishlistService;
;
