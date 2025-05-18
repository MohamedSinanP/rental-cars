
import { inject, injectable } from "inversify";
import axios from 'axios';
import ICarService from "../interfaces/services/car.service";
import { fetchAddressFromCoordinates } from "../utils/geolocation";
import { CarDTO, CarFilter, ICarModel } from "../types/car";
import ICar from "../types/car";
import TYPES from "../di/types";
import ICarRepository from "../interfaces/repositories/car.repository";
import { UploadedFile } from "express-fileupload";
import { uploadPDFToCloudinary } from "../utils/uploadToCloudinary";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import IUserService from "../interfaces/services/user.service";
import { performOCR } from "../utils/ocr";
import { extractDocumentDataWithLLM } from "../utils/llm";
import { mapToCarDTO } from "../utils/helperFunctions";
import { StatTimer } from "pdfjs-dist/types/src/display/display_utils";

@injectable()
export default class CarService implements ICarService {
  constructor(
    @inject(TYPES.ICarRepository) private _carRepository: ICarRepository,
    @inject(TYPES.IUserService) private _userService: IUserService
  ) { }

  async fetchCarLocationAddresss(lng: number, lat: number): Promise<string> {
    const address = await fetchAddressFromCoordinates(lng, lat);
    return address;
  }

  async createCar(data: ICar & {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<CarDTO> {

    // upload all the docs to the cloudinary
    const rcDocUrl = await uploadPDFToCloudinary(data.rcDoc, "documents");
    const insuranceDocUrl = await uploadPDFToCloudinary(data.insuranceDoc, "documents");
    const pucDocUrl = await uploadPDFToCloudinary(data.pucDoc, "documents");

    const carToAdd: ICar = {
      ...data,
      rcDoc: rcDocUrl,
      insuranceDoc: insuranceDocUrl,
      pucDoc: pucDocUrl
    }

    const createdCar = await this._carRepository.addCar(carToAdd);
    return mapToCarDTO(createdCar);
  };

  async editCar(carId: string, data: Partial<ICar> & {
    rcDoc?: UploadedFile;
    insuranceDoc?: UploadedFile;
    pucDoc?: UploadedFile;
  }): Promise<CarDTO> {
    const carToEdit: Partial<ICar> = { ...data };

    if (data.rcDoc) {
      const rcDocUrl = await uploadPDFToCloudinary(data.rcDoc, "documents");
      carToEdit.rcDoc = rcDocUrl;
      delete carToEdit.rcDoc;
    }

    if (data.insuranceDoc) {
      const insuranceDocUrl = await uploadPDFToCloudinary(data.insuranceDoc, "documents");
      carToEdit.insuranceDoc = insuranceDocUrl;
      delete carToEdit.insuranceDoc;
    }

    if (data.pucDoc) {
      const pucDocUrl = await uploadPDFToCloudinary(data.pucDoc, "documents");
      carToEdit.pucDoc = pucDocUrl;
      delete carToEdit.pucDoc;
    }

    const updatedCar = await this._carRepository.editCar(carId, carToEdit);
    return mapToCarDTO(updatedCar);
  };

  async toggleCarListing(ownerId: string, carId: string): Promise<CarDTO> {
    const car = await this._carRepository.findById(carId);

    if (!car) {
      throw new HttpError(StatusCode.NOT_FOUND, "Car not found",);
    }

    if (car.ownerId.toString() !== ownerId) {
      throw new HttpError(StatusCode.FORBIDDEN, "Unauthorized access",);
    }

    const updatedCar = await this._carRepository.update(carId, {
      isListed: !car.isListed
    });

    if (!updatedCar) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't change your car listing status.")
    }
    return mapToCarDTO(updatedCar);
  };

  async reuploadCarDocs(carId: string, carDocs: {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<CarDTO> {

    const rcDocUrl = await uploadPDFToCloudinary(carDocs.rcDoc, "documents");
    const pucDocUrl = await uploadPDFToCloudinary(carDocs.pucDoc, "documents");
    const insuranceDocUrl = await uploadPDFToCloudinary(carDocs.insuranceDoc, "documents");


    const updatedCar = await this._carRepository.update(carId, { rcDoc: rcDocUrl, pucDoc: pucDocUrl, insuranceDoc: insuranceDocUrl, verificationRejected: false });
    if (!updatedCar) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update your car docs");
    };
    return mapToCarDTO(updatedCar);
  }

  async fetchOwnerVerifedCars(userId: string, page: number, limit: number): Promise<PaginatedData<CarDTO>> {
    const { data, total } = await this._carRepository.findByOwner(userId, page, limit);
    if (!data) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Can't find cars with your details.")
    }
    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(mapToCarDTO),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  };

  async fetchOwnerCars(userId: string): Promise<CarDTO[]> {
    const cars = await this._carRepository.findAll({ ownerId: userId });
    if (!cars) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Can't find cars with your details.")
    }
    return cars.map(mapToCarDTO);
  };

  async fetchCarsWithoutDistance(page: number, limit: number, filters: CarFilter): Promise<PaginatedData<CarDTO>> {
    const { data, total } = await this._carRepository.findPaginated(page, limit, filters);
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(mapToCarDTO),
      totalPages,
      currentPage: page,
    };
  };

  async fetchCarsWithDistance(userId: string, page: number, limit: number, filters: CarFilter): Promise<PaginatedData<CarDTO>> {
    const userLocation = await this._userService.getUserLocation(userId);

    if (!userLocation) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User location not found.");
    };

    const { data, total } = await this._carRepository.findPaginatedWithDistance(userLocation, page, limit, filters);

    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(mapToCarDTO),
      totalPages,
      currentPage: page
    };
  }


  async fetchCarDetails(id: string): Promise<CarDTO> {
    const car = await this._carRepository.findById(id);
    if (!car) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    };
    return mapToCarDTO(car);
  };

  async fetchSimilarCars(id: string): Promise<CarDTO[]> {
    const car = await this._carRepository.findById(id);
    if (!car) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }
    const type = car?.carType;
    const cars = await this._carRepository.findAll({
      carType: type,
      _id: { $ne: id }
    });
    return cars.map(mapToCarDTO);
  };

  async fetchPendingCars(): Promise<CarDTO[]> {
    const cars = await this._carRepository.findAll({
      isVerified: false,
      verificationRejected: false,
    });
    if (!cars) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }
    return cars.map(mapToCarDTO);
  };

  async verifyCar(carId: string): Promise<CarDTO> {
    const updatedCar = await this._carRepository.update(String(carId), { isVerified: true });
    if (!updatedCar) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't update car details");
    }
    return mapToCarDTO(updatedCar);
  };

  async rejectCar(carId: string, rejectionReason: string): Promise<CarDTO> {
    const updatedCar = await this._carRepository.update(String(carId), {
      verificationRejected: true,
      rejectionReason
    });
    if (!updatedCar) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't update car details");
    }
    return mapToCarDTO(updatedCar);
  };

  async getCarDocsDetails(carId: string, userMessage: string): Promise<string> {

    const carDocs = await this._carRepository.getCarDocumentsById(carId);
    if (!carDocs) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find document of this car");
    };
    const [rcText, pucText, insuranceText] = await Promise.all([
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
    const llmResponse = await this._llmQuery(prompt);
    return llmResponse;
  }

  async _performOCRFromUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      return performOCR(buffer, url);
    } catch (error: any) {
      console.error('Error fetching or processing image:', error.message, error.stack);
      return '';
    };
  };


  async _llmQuery(prompt: string): Promise<string> {
    return extractDocumentDataWithLLM(prompt);
  };

  async getMaxPriceAndDistance(): Promise<{ maxPrice: number; maxDistance: number }> {
    const maxPriceResult = await this._carRepository.findMaxPrice();
    const maxDistance = 1000;

    return {
      maxPrice: maxPriceResult || 5000,
      maxDistance
    };
  };
};
