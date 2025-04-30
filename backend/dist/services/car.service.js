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
const axios_1 = __importDefault(require("axios"));
const geolocation_js_1 = require("../utils/geolocation.js");
const types_js_1 = __importDefault(require("../di/types.js"));
const uploadToCloudinary_js_1 = require("../utils/uploadToCloudinary.js");
const http_error_js_1 = require("../utils/http.error.js");
const types_js_2 = require("../types/types.js");
const ocr_js_1 = require("../utils/ocr.js");
const llm_js_1 = require("../utils/llm.js");
let CarService = class CarService {
    _carRepository;
    _userService;
    constructor(_carRepository, _userService) {
        this._carRepository = _carRepository;
        this._userService = _userService;
    }
    async fetchCarLocationAddresss(lng, lat) {
        const address = await (0, geolocation_js_1.fetchAddressFromCoordinates)(lng, lat);
        return address;
    }
    async createCar(data) {
        // upload all the docs to the cloudinary
        const rcDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.rcDoc, "documents");
        const insuranceDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.insuranceDoc, "documents");
        const pucDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.pucDoc, "documents");
        const carToAdd = {
            ...data,
            rcDoc: rcDocUrl,
            insuranceDoc: insuranceDocUrl,
            pucDoc: pucDocUrl
        };
        return await this._carRepository.addCar(carToAdd);
    }
    ;
    async editCar(carId, data) {
        const carToEdit = { ...data };
        if (data.rcDoc) {
            const rcDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.rcDoc, "documents");
            carToEdit.rcDoc = rcDocUrl;
            delete carToEdit.rcDoc;
        }
        if (data.insuranceDoc) {
            const insuranceDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.insuranceDoc, "documents");
            carToEdit.insuranceDoc = insuranceDocUrl;
            delete carToEdit.insuranceDoc;
        }
        if (data.pucDoc) {
            const pucDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(data.pucDoc, "documents");
            carToEdit.pucDoc = pucDocUrl;
            delete carToEdit.pucDoc;
        }
        return await this._carRepository.editCar(carId, carToEdit);
    }
    ;
    async reuploadCarDocs(carId, carDocs) {
        const rcDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(carDocs.rcDoc, "documents");
        const pucDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(carDocs.pucDoc, "documents");
        const insuranceDocUrl = await (0, uploadToCloudinary_js_1.uploadPDFToCloudinary)(carDocs.insuranceDoc, "documents");
        const updatedCar = await this._carRepository.update(carId, { rcDoc: rcDocUrl, pucDoc: pucDocUrl, insuranceDoc: insuranceDocUrl, verificationRejected: false });
        if (!updatedCar) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update your car docs");
        }
        ;
        return updatedCar;
    }
    async fetchOwnerVerifedCars(userId, page, limit) {
        const { data, total } = await this._carRepository.findByOwner(userId, page, limit);
        if (!data) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.UNAUTHORIZED, "Can't find cars with your details.");
        }
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page
        };
    }
    ;
    async fetchOwnerCars(userId) {
        const cars = await this._carRepository.findAll({ ownerId: userId });
        if (!cars) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.UNAUTHORIZED, "Can't find cars with your details.");
        }
        return cars;
    }
    ;
    async fetchCarsWithoutDistance(page, limit) {
        const { data, total } = await this._carRepository.findPaginated(page, limit);
        if (!data) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        ;
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page,
        };
    }
    ;
    async fetchCarsWithDistance(userId, page, limit) {
        const userLocation = await this._userService.getUserLocation(userId);
        if (!userLocation) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "User location not found.");
        }
        ;
        const { data, total } = await this._carRepository.findPaginatedWithDistance(userLocation, page, limit);
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page
        };
    }
    async fetchCarDetails(id) {
        const car = await this._carRepository.findById(id);
        if (!car) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        ;
        return car;
    }
    ;
    async fetchSimilarCars(id) {
        const car = await this._carRepository.findById(id);
        if (!car) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        const type = car?.carType;
        const cars = await this._carRepository.findAll({ carType: type });
        return cars;
    }
    ;
    async fetchPendingCars() {
        const cars = await this._carRepository.findAll({
            isVerified: false,
            verificationRejected: false,
        });
        if (!cars) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        return cars;
    }
    ;
    async verifyCar(carId) {
        const updatedCar = await this._carRepository.update(String(carId), { isVerified: true });
        if (!updatedCar) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't update car details");
        }
        return updatedCar;
    }
    ;
    async rejectCar(carId, rejectionReason) {
        const updatedCar = await this._carRepository.update(String(carId), {
            verificationRejected: true,
            rejectionReason
        });
        if (!updatedCar) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't update car details");
        }
        return updatedCar;
    }
    ;
    async getCarDocsDetails(carId, userMessage) {
        const carDocs = await this._carRepository.getCarDocumentsById(carId);
        const [rcText, pucText, insuranceText] = await Promise.all([
            this._performOCRFromUrl(carDocs.rcUrl),
            this._performOCRFromUrl(carDocs.pucUrl),
            this._performOCRFromUrl(carDocs.insuranceUrl),
        ]);
        const prompt = `
    The following are scanned documents of a car:
    
    --- RC Document ---
    ${rcText}
    
    --- PUC Document ---
    ${pucText}
    
    --- Insurance Document ---
    ${insuranceText}
    
    The car owner asked:
    "${userMessage}"
    
    Please answer based on the above documents only.
    `;
        const llmResponse = await this._llmQuery(prompt);
        return llmResponse;
    }
    async _performOCRFromUrl(url) {
        try {
            console.log('Fetching URL:', url);
            const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            console.log('Fetched buffer size:', buffer.length);
            return (0, ocr_js_1.performOCR)(buffer, url);
        }
        catch (error) {
            console.error('Error fetching or processing image:', error.message, error.stack);
            return '';
        }
    }
    async _llmQuery(prompt) {
        return (0, llm_js_1.extractDocumentDataWithLLM)(prompt);
    }
};
CarService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.ICarRepository)),
    __param(1, (0, inversify_1.inject)(types_js_1.default.IUserService)),
    __metadata("design:paramtypes", [Object, Object])
], CarService);
exports.default = CarService;
;
//# sourceMappingURL=car.service.js.map