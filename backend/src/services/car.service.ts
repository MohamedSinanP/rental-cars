
import { inject, injectable } from "inversify";
import axios from 'axios';
import ICarService from "../interfaces/services/car.service";
import { fetchAddressFromCoordinates } from "../utils/geolocation";
import { ICarModel } from "../types/car";
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
  }): Promise<ICarModel> {

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

    return await this._carRepository.addCar(carToAdd);
  };

  async editCar(carId: string, data: Partial<ICar> & {
    rcDoc?: UploadedFile;
    insuranceDoc?: UploadedFile;
    pucDoc?: UploadedFile;
  }): Promise<ICarModel> {
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

    return await this._carRepository.editCar(carId, carToEdit);
  };

  async reuploadCarDocs(carId: string, carDocs: {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<ICarModel> {

    const rcDocUrl = await uploadPDFToCloudinary(carDocs.rcDoc, "documents");
    const pucDocUrl = await uploadPDFToCloudinary(carDocs.pucDoc, "documents");
    const insuranceDocUrl = await uploadPDFToCloudinary(carDocs.insuranceDoc, "documents");


    const updatedCar = await this._carRepository.update(carId, { rcDoc: rcDocUrl, pucDoc: pucDocUrl, insuranceDoc: insuranceDocUrl, verificationRejected: false });
    if (!updatedCar) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update your car docs");
    };
    return updatedCar;
  }

  async fetchOwnerVerifedCars(userId: string, page: number, limit: number): Promise<PaginatedData<ICarModel>> {
    const { data, total } = await this._carRepository.findByOwner(userId, page, limit);
    if (!data) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Can't find cars with your details.")
    }
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page
    };
  };

  async fetchOwnerCars(userId: string): Promise<ICarModel[]> {
    const cars = await this._carRepository.findAll({ ownerId: userId });
    if (!cars) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Can't find cars with your details.")
    }
    return cars;
  };

  async fetchCarsWithoutDistance(page: number, limit: number): Promise<PaginatedData<ICarModel>> {
    const { data, total } = await this._carRepository.findPaginated(page, limit);
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async fetchCarsWithDistance(userId: string, page: number, limit: number): Promise<PaginatedData<ICarModel>> {
    const userLocation = await this._userService.getUserLocation(userId);

    if (!userLocation) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User location not found.");
    };

    const { data, total } = await this._carRepository.findPaginatedWithDistance(userLocation, page, limit);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page
    };
  }


  async fetchCarDetails(id: string): Promise<ICarModel> {
    const car = await this._carRepository.findById(id);
    if (!car) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    };
    return car;
  };

  async fetchSimilarCars(id: string): Promise<ICarModel[]> {
    const car = await this._carRepository.findById(id);
    if (!car) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }
    const type = car?.carType;
    const cars = await this._carRepository.findAll({ carType: type });
    return cars
  };

  async fetchPendingCars(): Promise<ICarModel[]> {
    const cars = await this._carRepository.findAll({
      isVerified: false,
      verificationRejected: false,
    });
    if (!cars) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }
    return cars;
  };

  async verifyCar(carId: string): Promise<ICarModel> {
    const updatedCar = await this._carRepository.update(String(carId), { isVerified: true });
    if (!updatedCar) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't update car details");
    }
    return updatedCar;
  };

  async rejectCar(carId: string, rejectionReason: string): Promise<ICarModel> {
    const updatedCar = await this._carRepository.update(String(carId), {
      verificationRejected: true,
      rejectionReason
    });
    if (!updatedCar) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't update car details");
    }
    return updatedCar;
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
  }
};
