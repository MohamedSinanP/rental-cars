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
const axios_1 = __importDefault(require("axios"));
const geolocation_1 = require("../utils/geolocation");
const types_1 = __importDefault(require("../di/types"));
const uploadToCloudinary_1 = require("../utils/uploadToCloudinary");
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
const ocr_1 = require("../utils/ocr");
const llm_1 = require("../utils/llm");
const helperFunctions_1 = require("../utils/helperFunctions");
let CarService = class CarService {
    constructor(_carRepository, _userService) {
        this._carRepository = _carRepository;
        this._userService = _userService;
    }
    fetchCarLocationAddresss(lng, lat) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield (0, geolocation_1.fetchAddressFromCoordinates)(lng, lat);
            return address;
        });
    }
    createCar(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // upload all the docs to the cloudinary
            const rcDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.rcDoc, "documents");
            const insuranceDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.insuranceDoc, "documents");
            const pucDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.pucDoc, "documents");
            const carToAdd = Object.assign(Object.assign({}, data), { rcDoc: rcDocUrl, insuranceDoc: insuranceDocUrl, pucDoc: pucDocUrl });
            const createdCar = yield this._carRepository.addCar(carToAdd);
            return (0, helperFunctions_1.mapToCarDTO)(createdCar);
        });
    }
    ;
    editCar(carId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const carToEdit = Object.assign({}, data);
            if (data.rcDoc) {
                const rcDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.rcDoc, "documents");
                carToEdit.rcDoc = rcDocUrl;
                delete carToEdit.rcDoc;
            }
            if (data.insuranceDoc) {
                const insuranceDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.insuranceDoc, "documents");
                carToEdit.insuranceDoc = insuranceDocUrl;
                delete carToEdit.insuranceDoc;
            }
            if (data.pucDoc) {
                const pucDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(data.pucDoc, "documents");
                carToEdit.pucDoc = pucDocUrl;
                delete carToEdit.pucDoc;
            }
            const updatedCar = yield this._carRepository.editCar(carId, carToEdit);
            return (0, helperFunctions_1.mapToCarDTO)(updatedCar);
        });
    }
    ;
    toggleCarListing(ownerId, carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const car = yield this._carRepository.findById(carId);
            if (!car) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Car not found");
            }
            if (car.ownerId.toString() !== ownerId) {
                throw new http_error_1.HttpError(types_2.StatusCode.FORBIDDEN, "Unauthorized access");
            }
            const updatedCar = yield this._carRepository.update(carId, {
                isListed: !car.isListed
            });
            if (!updatedCar) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't change your car listing status.");
            }
            return (0, helperFunctions_1.mapToCarDTO)(updatedCar);
        });
    }
    ;
    reuploadCarDocs(carId, carDocs) {
        return __awaiter(this, void 0, void 0, function* () {
            const rcDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(carDocs.rcDoc, "documents");
            const pucDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(carDocs.pucDoc, "documents");
            const insuranceDocUrl = yield (0, uploadToCloudinary_1.uploadPDFToCloudinary)(carDocs.insuranceDoc, "documents");
            const updatedCar = yield this._carRepository.update(carId, { rcDoc: rcDocUrl, pucDoc: pucDocUrl, insuranceDoc: insuranceDocUrl, verificationRejected: false });
            if (!updatedCar) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update your car docs");
            }
            ;
            return (0, helperFunctions_1.mapToCarDTO)(updatedCar);
        });
    }
    fetchOwnerVerifedCars(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._carRepository.findByOwner(userId, page, limit);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.UNAUTHORIZED, "Can't find cars with your details.");
            }
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.mapToCarDTO),
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        });
    }
    ;
    fetchOwnerCars(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cars = yield this._carRepository.findAll({ ownerId: userId });
            if (!cars) {
                throw new http_error_1.HttpError(types_2.StatusCode.UNAUTHORIZED, "Can't find cars with your details.");
            }
            return cars.map(helperFunctions_1.mapToCarDTO);
        });
    }
    ;
    fetchCarsWithoutDistance(page, limit, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._carRepository.findPaginated(page, limit, filters);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            ;
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.mapToCarDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    ;
    fetchCarsWithDistance(userId, page, limit, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const userLocation = yield this._userService.getUserLocation(userId);
            if (!userLocation) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "User location not found.");
            }
            ;
            const { data, total } = yield this._carRepository.findPaginatedWithDistance(userLocation, page, limit, filters);
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.mapToCarDTO),
                totalPages,
                currentPage: page
            };
        });
    }
    fetchCarDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const car = yield this._carRepository.findById(id);
            if (!car) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            ;
            return (0, helperFunctions_1.mapToCarDTO)(car);
        });
    }
    ;
    fetchSimilarCars(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const car = yield this._carRepository.findById(id);
            if (!car) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            const type = car === null || car === void 0 ? void 0 : car.carType;
            const cars = yield this._carRepository.findAll({
                carType: type,
                _id: { $ne: id }
            });
            return cars.map(helperFunctions_1.mapToCarDTO);
        });
    }
    ;
    fetchPendingCars() {
        return __awaiter(this, void 0, void 0, function* () {
            const cars = yield this._carRepository.findAll({
                isVerified: false,
                verificationRejected: false,
            });
            if (!cars) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            return cars.map(helperFunctions_1.mapToCarDTO);
        });
    }
    ;
    verifyCar(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCar = yield this._carRepository.update(String(carId), { isVerified: true });
            if (!updatedCar) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't update car details");
            }
            return (0, helperFunctions_1.mapToCarDTO)(updatedCar);
        });
    }
    ;
    rejectCar(carId, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCar = yield this._carRepository.update(String(carId), {
                verificationRejected: true,
                rejectionReason
            });
            if (!updatedCar) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't update car details");
            }
            return (0, helperFunctions_1.mapToCarDTO)(updatedCar);
        });
    }
    ;
    getCarDocsDetails(carId, userMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const carDocs = yield this._carRepository.getCarDocumentsById(carId);
            if (!carDocs) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find document of this car");
            }
            ;
            const [rcText, pucText, insuranceText] = yield Promise.all([
                this._performOCRFromUrl(carDocs.rcUrl),
                this._performOCRFromUrl(carDocs.pucUrl),
                this._performOCRFromUrl(carDocs.insuranceUrl),
            ]);
            const prompt = `
You are an AI assistant analyzing scanned car documents. Use the contents below to answer a user query.

--- RC Document ---
${rcText}

--- PUC Document ---
${pucText}

--- Insurance Document ---
${insuranceText}

The user asked:
"${userMessage}"

Instructions:
- If the answer is present in the documents, use it.
- If a document section is empty, **assume it's missing** and then respond using **general vehicle/domain knowledge**.
- When assuming, clearly say: "Based on general knowledge..." or "Assuming based on standard practices..."

Respond in 1-2 lines. Begin with "Answer:".
`;
            const llmResponse = yield this._llmQuery(prompt);
            return llmResponse;
        });
    }
    _performOCRFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                return (0, ocr_1.performOCR)(buffer, url);
            }
            catch (error) {
                console.error('Error fetching or processing image:', error.message, error.stack);
                return '';
            }
            ;
        });
    }
    ;
    _llmQuery(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, llm_1.extractDocumentDataWithLLM)(prompt);
        });
    }
    ;
    getMaxPriceAndDistance() {
        return __awaiter(this, void 0, void 0, function* () {
            const maxPriceResult = yield this._carRepository.findMaxPrice();
            const maxDistance = 1000;
            return {
                maxPrice: maxPriceResult || 5000,
                maxDistance
            };
        });
    }
    ;
};
CarService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ICarRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserService)),
    __metadata("design:paramtypes", [Object, Object])
], CarService);
exports.default = CarService;
;
