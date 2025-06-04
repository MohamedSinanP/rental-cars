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
const types_2 = require("../types/types");
const http_response_1 = require("../utils/http.response");
let ReviewController = class ReviewController {
    constructor(_reviewService) {
        this._reviewService = _reviewService;
    }
    addReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const carId = req.params.id;
                const { rating, comment } = req.body;
                const newReview = yield this._reviewService.addReview(userId, carId, rating, comment);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.created(newReview));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllCarReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const carId = req.params.id;
                const reviews = yield this._reviewService.getAllCarReviews(carId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(reviews));
            }
            catch (error) {
                next(error);
            }
        });
    }
};
ReviewController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IReviewService)),
    __metadata("design:paramtypes", [Object])
], ReviewController);
exports.default = ReviewController;
