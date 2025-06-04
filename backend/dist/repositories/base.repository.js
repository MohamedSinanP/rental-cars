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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const mongoose_1 = require("mongoose");
const inversify_1 = require("inversify");
let BaseRepository = class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    ;
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(data);
        });
    }
    ;
    findById(id, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.model.findById(id);
            if (populate) {
                query = query.populate(populate);
            }
            return yield query.exec();
        });
    }
    ;
    findOne(query, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            let findQuery = this.model.findOne(query);
            if (populate) {
                findQuery = findQuery.populate(populate);
            }
            return yield findQuery.exec();
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (query = {}, populate) {
            let findQuery = this.model.find(query);
            if (populate) {
                findQuery = findQuery.populate(populate);
            }
            return yield findQuery.exec();
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, data, { new: true }).exec();
        });
    }
    ;
    updateByFilter(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate(filter, data, { new: true }).exec();
        });
    }
    ;
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.findByIdAndDelete(id).exec();
            return !!result;
        });
    }
    ;
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BaseRepository);
;
