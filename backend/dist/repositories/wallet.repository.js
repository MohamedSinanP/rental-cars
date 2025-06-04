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
let WalletRepository = class WalletRepository extends base_repository_1.BaseRepository {
    constructor(_walletModel) {
        super(_walletModel);
        this._walletModel = _walletModel;
    }
    ;
    refundToWallet(userId, amount, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield this._walletModel.findOne({ userId });
            const transaction = {
                paymentType: 'credit',
                transactionAmount: amount,
                date: new Date(),
            };
            if (transactionId) {
                transaction.transactionId;
            }
            ;
            if (!wallet) {
                wallet = yield this._walletModel.create({
                    userId,
                    balance: amount,
                    transactions: [transaction],
                });
            }
            else {
                wallet.balance += amount;
                wallet.transactions.push(transaction);
                yield wallet.save();
            }
            return wallet;
        });
    }
    ;
};
WalletRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.WalletModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], WalletRepository);
exports.default = WalletRepository;
;
