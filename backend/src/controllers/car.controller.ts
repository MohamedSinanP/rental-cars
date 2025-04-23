import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import ICarController, { FileUploadRequest } from "../interfaces/controllers/car.controller";
import TYPES from "../di/types";
import ICarService from "../interfaces/services/car.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import ICar from "../types/car";
import { UploadedFile } from "express-fileupload";

@injectable()
export default class CarController implements ICarController {
  constructor(
    @inject(TYPES.ICarService) private carService: ICarService,
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
        availability: req.body.availability,
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
      const newCar = await this.carService.createCar(carData);
      res.status(201).json(HttpResponse.created(newCar, "New car added successfully.Your car will be hosted after verification"));
    } catch (error) {
      next(error);
    };
  };

  async editCar(req: FileUploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("i am working", req.body);

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
        availability: req.body.availability,
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

      const updatedCar = await this.carService.editCar(carId, carData);
      res.status(200).json(HttpResponse.success(updatedCar));
    } catch (error) {
      next(error);
    };
  };

  async getAddressFromCoordinates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat } = req.query;
      const address = await this.carService.fetchCarLocationAddresss(Number(lng), Number(lat));
      res.status(200).json({ address });
    } catch (error) {
      next(error);
    };
  };

  async fetchOwnerVerifedCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      if (userId) {
        const cars = await this.carService.fetchOwnerVerifedCars(userId);
        res.status(200).json(HttpResponse.success({ cars }));
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
        const cars = await this.carService.fetchOwnerCars(userId);
        res.status(200).json(HttpResponse.success({ cars }));
      }
    } catch (error) {
      next(error);
    }
  }

  async getAllCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const cars = await this.carService.fetchAllCars(page, limit);
      res.status(200).json(HttpResponse.success(cars));
    } catch (error) {
      next(error);
    };
  };

  async carDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const car = await this.carService.fetchCarDetails(id);
      res.status(200).json(HttpResponse.success(car));
    } catch (error) {
      next(error);
    };
  };

  async similarCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const cars = await this.carService.fetchSimilarCars(id);
      res.status(200).json(HttpResponse.success(cars));
    } catch (error) {
      next(error);
    };
  };
};