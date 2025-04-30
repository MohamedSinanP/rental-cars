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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const mongoose_1 = require("mongoose");
const inversify_1 = require("inversify");
let BaseRepository = class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    ;
    async create(data) {
        return await this.model.create(data);
    }
    ;
    async findById(id) {
        return await this.model.findById(id).exec();
    }
    ;
    async findOne(query) {
        return await this.model.findOne(query).exec();
    }
    ;
    async findAll(query = {}) {
        return await this.model.find(query).exec();
    }
    ;
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    ;
    async updateByFilter(filter, data) {
        return await this.model.findOneAndUpdate(filter, data, { new: true }).exec();
    }
    ;
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }
    ;
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BaseRepository);
;
//# sourceMappingURL=base.repository.js.map