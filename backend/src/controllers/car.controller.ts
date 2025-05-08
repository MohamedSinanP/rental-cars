import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import ICarController, { FileUploadRequest } from "../interfaces/controllers/car.controller";
import TYPES from "../di/types";
import ICarService from "../interfaces/services/car.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import ICar from "../types/car";
import { UploadedFile } from "express-fileupload";
import { StatusCode } from "../types/types";

@injectable()
export default class CarController implements ICarController {
  constructor(
    @inject(TYPES.ICarService) private _carService: ICarService,
  ) { };

  async createCar(req: FileUploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user?.userId!;
      const parsedLocation = JSON.parse(req.body.location);
      const parsedCarImages = JSON.parse(req.body.carImages);

      const carData: ICar & {
        rcDoc: UploadedFile;
        pucDoc: UploadedFile;
        insuranceDoc: UploadedFile;
      } = {
        carName: req.body.carName,
        carModel: req.body.carModel,
        carType: req.body.carType,
        seats: req.body.seats,
        transmission: req.body.transmission,
        fuelType: req.body.fuelType,
        fuelOption: req.body.fuelOption,
        ownerId,
        carImages: parsedCarImages,
        location: parsedLocation,
        status: req.body.status,
        features: req.body.features,
        pricePerDay: Number(req.body.pricePerDay),
        deposit: Number(req.body.deposit),
        lastmaintenanceDate: req.body.lastmaintenanceDate,
        maintenanceInterval: Number(req.body.maintenanceInterval),
        isListed: true,
        rcDoc: req.files.rcDoc,
        pucDoc: req.files.pucDoc,
        insuranceDoc: req.files.insuranceDoc,
      };
      const newCar = await this._carService.createCar(carData);
      res.status(StatusCode.CREATED).json(HttpResponse.created(newCar, "New car added successfully.Your car will be hosted after verification"));
    } catch (error) {
      next(error);
    };
  };

  async editCar(req: FileUploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.body.carId;
      const ownerId = req.user?.userId!;
      const parsedLocation = JSON.parse(req.body.location);
      const parsedCarImages = JSON.parse(req.body.carImages);

      const carData: Partial<ICar> = {
        carName: req.body.carName,
        carModel: req.body.carModel,
        carType: req.body.carType,
        seats: req.body.seats,
        transmission: req.body.transmission,
        fuelType: req.body.fuelType,
        fuelOption: req.body.fuelOption,
        ownerId,
        carImages: parsedCarImages,
        location: parsedLocation,
        status: req.body.status,
        features: req.body.features,
        pricePerDay: Number(req.body.pricePerDay),
        deposit: Number(req.body.deposit),
        lastmaintenanceDate: req.body.lastmaintenanceDate,
        maintenanceInterval: Number(req.body.maintenanceInterval),
        isListed: true,
      };
      if (req.files) {
        if (req.files.rcDoc) {
          carData.rcDoc = req.files.rcDoc;
        }

        if (req.files.pucDoc) {
          carData.pucDoc = req.files.pucDoc;
        }

        if (req.files.insuranceDoc) {
          carData.insuranceDoc = req.files.insuranceDoc;
        }
      };

      const updatedCar = await this._carService.editCar(carId, carData);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedCar));
    } catch (error) {
      next(error);
    };
  };

  async reuploadCarDocs(req: FileUploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      const carDocs: {
        rcDoc: UploadedFile;
        insuranceDoc: UploadedFile;
        pucDoc: UploadedFile
      } = {
        rcDoc: req.files.rcDoc,
        pucDoc: req.files.pucDoc,
        insuranceDoc: req.files.insuranceDoc
      };
      const updatedCar = await this._carService.reuploadCarDocs(carId, carDocs);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedCar, "Your documents will verified in 24 hours"));
    } catch (error) {
      next(error);
    };
  };

  async getAddressFromCoordinates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat } = req.query;
      const address = await this._carService.fetchCarLocationAddresss(Number(lng), Number(lat));
      res.status(StatusCode.OK).json({ address });
    } catch (error) {
      next(error);
    };
  };

  async fetchOwnerVerifedCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      if (userId) {
        const cars = await this._carService.fetchOwnerVerifedCars(userId, page, limit);
        res.status(StatusCode.OK).json(HttpResponse.success(cars));
      }
    } catch (error) {
      next(error);
    };
  };

  async fetchOwnerAllCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      if (userId) {
        const cars = await this._carService.fetchOwnerCars(userId);
        res.status(StatusCode.OK).json(HttpResponse.success({ cars }));
      }
    } catch (error) {
      next(error);
    }
  }

  async getAllCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const { user } = req as AuthenticatedRequest;

      let result;
      if (user) {
        result = await this._carService.fetchCarsWithDistance(user.userId, page, limit);
      } else {
        result = await this._carService.fetchCarsWithoutDistance(page, limit);
      }
      res.status(StatusCode.OK).json(HttpResponse.success(result));
    } catch (error) {
      next(error);
    };
  };

  async carDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const car = await this._carService.fetchCarDetails(id);
      res.status(StatusCode.OK).json(HttpResponse.success(car));
    } catch (error) {
      next(error);
    };
  };

  async similarCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const cars = await this._carService.fetchSimilarCars(id);
      res.status(StatusCode.OK).json(HttpResponse.success(cars));
    } catch (error) {
      next(error);
    };
  };

  async getCarDocsDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      const { userMessage } = req.body;
      const result = await this._carService.getCarDocsDetails(carId, userMessage);
      res.status(StatusCode.OK).json(HttpResponse.success({ answer: result }));
    } catch (error) {
      next(error);
    };
  };
};