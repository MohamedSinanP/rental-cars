"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Car = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const carSchema = new mongoose_1.Schema({
    carName: { type: String, required: true },
    carModel: { type: String, required: true },
    carType: { type: String, required: true },
    seats: { type: String, required: true },
    transmission: { type: String, required: true },
    fuelType: { type: String, required: true },
    fuelOption: { type: String, required: true },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    carImages: [{ type: String, required: true }],
    rcDoc: { type: String, required: true },
    pucDoc: { type: String, required: true },
    insuranceDoc: { type: String, required: true },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationRejected: {
        type: Boolean,
        default: false,
    },
    rejectionReason: {
        type: String,
        default: '',
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ["Available", "Booked", "Unavailable", "UnderMaintenance", "PendingApproval", "Archived"],
        default: "PendingApproval",
    },
    features: [{ type: String }],
    pricePerHour: { type: Number, required: true },
    deposit: { type: Number, required: true },
    lastmaintenanceDate: { type: String, required: true },
    maintenanceInterval: { type: Number, required: true },
    isListed: { type: Boolean, default: true },
}, {
    timestamps: true,
});
carSchema.index({ location: "2dsphere" });
exports.Car = (0, mongoose_1.model)("Car", carSchema);
