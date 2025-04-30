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
const base_repository_js_1 = require("./base.repository.js");
const types_js_1 = __importDefault(require("../di/types.js"));
const mongoose_1 = require("mongoose");
let UserRepository = class UserRepository extends base_repository_js_1.BaseRepository {
    userModel;
    constructor(userModel) {
        super(userModel);
        this.userModel = userModel;
    }
    async register(data) {
        return await this.userModel.create(data);
    }
    async findByEmail(email) {
        return await this.userModel.findOne({ email }).exec();
    }
    async findByEmailAndUpdate(email, refreshToken) {
        await this.userModel.updateOne({ email }, {
            $set: { otp: null, refreshToken, otpExpiresAt: null, isVerified: true }
        }).exec();
    }
    ;
    async findPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const data = await this.userModel.find().skip(skip).limit(limit);
        const total = await this.userModel.countDocuments();
        return { data, total };
    }
    ;
};
UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.UserModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], UserRepository);
exports.default = UserRepository;
;
//# sourceMappingURL=user.repository.js.map