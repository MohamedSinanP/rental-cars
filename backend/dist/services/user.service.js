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
const bcrypt_1 = __importDefault(require("bcrypt"));
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
const geolocation_1 = require("../utils/geolocation");
const mongoose_1 = require("mongoose");
const helperFunctions_1 = require("../utils/helperFunctions");
let UserService = class UserService {
    constructor(_userRepository, _addressRepository, _walletRepository) {
        this._userRepository = _userRepository;
        this._addressRepository = _addressRepository;
        this._walletRepository = _walletRepository;
    }
    ;
    fetchUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(userId);
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.UNAUTHORIZED, "User not found");
            }
            ;
            return {
                id: user._id.toString(),
                userName: user.userName,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                isVerified: user.isVerified
            };
        });
    }
    ;
    getUserDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.getUserDetails(userId);
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User not found");
            }
            ;
            return (0, helperFunctions_1.toUserDTO)(user);
        });
    }
    ;
    fetchAllUsers(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._userRepository.findPaginated(page, limit, search);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User not found");
            }
            ;
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toUserDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    ;
    fetchUserLocationAddresss(lng, lat) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield (0, geolocation_1.fetchAddressFromCoordinates)(lng, lat);
            return address;
        });
    }
    setUserLocation(userId, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this._userRepository.update(userId, { location: location });
            if (!updatedUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update user");
            }
            ;
            return (0, helperFunctions_1.toUserDTO)(updatedUser);
        });
    }
    ;
    getUserLocation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(userId);
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find user");
            }
            if (!user.location || !Array.isArray(user.location.coordinates)) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User location is not set properly");
            }
            return user.location.coordinates;
        });
    }
    ;
    blockOrUnblockUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(userId);
            if (!user) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find user");
            }
            const updatedUser = yield this._userRepository.update(userId, {
                isBlocked: !user.isBlocked,
            });
            if (!updatedUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.INTERNAL_SERVER_ERROR, "Failed to block user");
            }
            return (0, helperFunctions_1.toUserDTO)(updatedUser);
        });
    }
    ;
    getUserAddresses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this._addressRepository.getUserAddresses(userId);
            if (!addresses) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Failed to fetch your address.");
            }
            ;
            return addresses.map(helperFunctions_1.toAddressDTO);
        });
    }
    ;
    getUserWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjId = new mongoose_1.Types.ObjectId(userId);
            const wallet = yield this._walletRepository.findOne({ userId: userObjId });
            if (!wallet) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Failed to fetch your wallet.");
            }
            ;
            return {
                userId: wallet.userId.toString(),
                transactions: wallet.transactions,
                balance: wallet.balance
            };
        });
    }
    ;
    updateUser(userId, userName, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this._userRepository.update(userId, { userName, email });
            if (!updatedUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update your information");
            }
            ;
            return {
                userName: updatedUser.userName,
                email: updatedUser.email
            };
        });
    }
    ;
    updatePassword(userId, currentPwd, newPwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !currentPwd || !newPwd) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User ID, current password, and new password are required");
            }
            if (typeof currentPwd !== 'string' || typeof newPwd !== 'string') {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Passwords must be strings");
            }
            const user = yield this._userRepository.findById(userId);
            if (!user)
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User not found");
            if (!user.password) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Password not set for this user");
            }
            const isMatch = yield bcrypt_1.default.compare(currentPwd, user.password);
            if (!isMatch)
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Current password is incorrect");
            const hashedNewPassword = yield bcrypt_1.default.hash(newPwd, 10);
            yield this._userRepository.update(userId, { password: hashedNewPassword });
        });
    }
    ;
    updateProfilePic(userId, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this._userRepository.update(userId, { profilePic });
            if (!updatedUser) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update your profile image");
            }
            ;
            return updatedUser.profilePic || "";
        });
    }
    ;
};
UserService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IAddressRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.IWalletRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], UserService);
exports.default = UserService;
;
