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
const base_repository_1 = require("./base.repository");
const types_1 = __importDefault(require("../di/types"));
const mongoose_1 = require("mongoose");
let UserRepository = class UserRepository extends base_repository_1.BaseRepository {
    constructor(_userModel) {
        super(_userModel);
        this._userModel = _userModel;
    }
    ;
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userModel.create(data);
        });
    }
    ;
    countUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userModel.countDocuments();
        });
    }
    getUserDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userModel.findById(userId).exec();
        });
    }
    ;
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userModel.findOne({ email }).exec();
        });
    }
    ;
    findPaginated(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const searchQuery = search
                ? {
                    $or: [
                        { userName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ]
                }
                : {};
            const data = yield this._userModel.find(searchQuery).skip(skip).limit(limit);
            const total = yield this._userModel.countDocuments();
            return { data, total };
        });
    }
    ;
};
UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.UserModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], UserRepository);
exports.default = UserRepository;
;
