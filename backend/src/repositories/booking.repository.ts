import mongoose, { FilterQuery, Model, Types } from "mongoose";
import { BasicSalesInfo, IBooking, IBookingModel, IBookingPopulated, RentalStatsForAdmin, RentalStatsForOwner } from "../types/booking";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { inject, injectable } from "inversify";
import IBookingRepository from "../interfaces/repositories/booking.repository";



@injectable()
export class BookingRepository extends BaseRepository<IBookingModel> implements IBookingRepository {
  constructor(@inject(TYPES.BookingModel) private _bookingModel: Model<IBookingModel>) {
    super(_bookingModel);
  };

  async bookCar(data: IBooking): Promise<IBookingModel> {
    return await this._bookingModel.create(data);
  };
  async findOne(query: FilterQuery<IBookingModel>): Promise<IBookingModel | null> {
    return this._bookingModel.findOne(query).exec();
  }
  async findAllByUserId(userId: string): Promise<IBookingModel[]> {
    return await this._bookingModel.find({ userId })
      .populate('userId')
      .populate('carId');
  };
  async findAllByOwnerId(ownerId: string, page: number, limit: number): Promise<{ data: IBookingModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this._bookingModel.find({ ownerId })
      .populate('carId')
      .populate('ownerId')
      .populate('userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this._bookingModel.countDocuments({ ownerId });
    return { data, total };
  };

  async findPaginated(id: string, page: number, limit: number): Promise<{ data: IBookingModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const data = await this._bookingModel.find({ userId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('carId')
      .populate('ownerId')
      .populate('userId');

    const total = await this._bookingModel.countDocuments({ userId: id });

    return { data, total };
  }

  async isBooked(carId: string, pickupDateTime: Date, dropoffDateTime: Date): Promise<IBookingModel | null> {
    const carObjId = new Types.ObjectId(carId)

    const isBooked = await this._bookingModel.findOne({
      carId: carObjId,
      $or: [
        {
          pickupDateTime: { $lte: dropoffDateTime },
          dropoffDateTime: { $gte: pickupDateTime },
        },
        {
          pickupDateTime: { $gte: pickupDateTime, $lte: dropoffDateTime },
        },
      ],
    });

    return isBooked;
  };

  async getTotalAdminEarnings(): Promise<number> {
    const result = await this._bookingModel.aggregate([
      {
        $match: {
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$adminCommissionAmount" }
        }
      }
    ]);

    return result[0]?.total || 0;
  };

  async getRentalStatsForAdmin(type: string, year: number, from: string, to: string): Promise<RentalStatsForAdmin[]> {
    const matchCondition: any = {
      paymentStatus: 'completed',
    };

    let groupBy: any = {};
    let dateProjection: any = {};

    if (type === 'monthly') {
      const selectedYear = year || new Date().getFullYear();

      matchCondition.createdAt = {
        $gte: new Date(`${selectedYear}-01-01T00:00:00Z`),
        $lte: new Date(`${selectedYear}-12-31T23:59:59Z`)
      };

      groupBy = {
        _id: { month: { $month: '$createdAt' } },
        totalCommission: { $sum: '$adminCommissionAmount' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          month: '$_id.month',
          totalCommission: 1,
          count: 1,
          _id: 0
        }
      };
    }

    else if (type === 'yearly') {
      groupBy = {
        _id: { year: { $year: '$createdAt' } },
        totalCommission: { $sum: '$adminCommissionAmount' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          year: '$_id.year',
          totalCommission: 1,
          count: 1,
          _id: 0
        }
      };
    }

    else if (type === 'custom') {
      if (!from || !to) throw new Error('From and To dates are required for custom stats');

      matchCondition.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      };

      groupBy = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        totalCommission: { $sum: '$adminCommissionAmount' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          date: '$_id.date',
          totalCommission: 1,
          count: 1,
          _id: 0
        }
      };
    }

    const result = await this._bookingModel.aggregate([
      { $match: matchCondition },
      { $group: groupBy },
      dateProjection
    ]);

    return result;
  };

  async getRentalStatsForOwner(ownerId: string, type: string, year: number, from: string, to: string): Promise<RentalStatsForOwner[]> {
    const matchCondition: any = {
      paymentStatus: 'completed',
      ownerId: new mongoose.Types.ObjectId(ownerId)
    };

    let groupBy: any = {};
    let dateProjection: any = {};

    if (type === 'monthly') {
      const selectedYear = year || new Date().getFullYear();

      matchCondition.createdAt = {
        $gte: new Date(`${selectedYear}-01-01T00:00:00Z`),
        $lte: new Date(`${selectedYear}-12-31T23:59:59Z`)
      };

      groupBy = {
        _id: { month: { $month: '$createdAt' } },
        totalEarnings: { $sum: '$ownerEarning' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          month: '$_id.month',
          totalEarnings: 1,
          count: 1,
          _id: 0
        }
      };
    }

    else if (type === 'yearly') {
      groupBy = {
        _id: { year: { $year: '$createdAt' } },
        totalEarnings: { $sum: '$ownerEarning' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          year: '$_id.year',
          totalEarnings: 1,
          count: 1,
          _id: 0
        }
      };
    }

    else if (type === 'custom') {
      if (!from || !to) throw new Error('From and To dates are required for custom stats');

      matchCondition.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      };

      groupBy = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        totalEarnings: { $sum: '$ownerEarning' },
        count: { $sum: 1 },
      };

      dateProjection = {
        $project: {
          date: '$_id.date',
          totalEarnings: 1,
          count: 1,
          _id: 0
        }
      };
    }

    const result = await this._bookingModel.aggregate([
      { $match: matchCondition },
      { $group: groupBy },
      dateProjection
    ]);

    return result;
  }

  async getTotalOwnerEarnings(ownerId: string): Promise<number> {
    const result = await this._bookingModel.aggregate([
      {
        $match: {
          _id: ownerId,
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$ownerEarning" }
        }
      }
    ]);

    return result[0]?.total || 0;
  };

  async bookingCountOfOwnerCars(ownerId: string): Promise<number> {
    return await this._bookingModel.countDocuments({
      ownerId: ownerId,
      paymentStatus: 'completed'
    })
  };

  async getTotalAdminCommissionForOwner(ownerId: string): Promise<number> {
    const result = await this._bookingModel.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$adminCommissionAmount" }
        }
      }
    ]);

    return result[0]?.totalCommission || 0;
  };

  async getPopulatedBooking(bookingId: string): Promise<IBookingPopulated | null> {
    const booking = await this._bookingModel
      .findById(bookingId)
      .populate('userId')
      .populate('carId')
      .populate('ownerId')
      .lean();

    if (!booking) return null;

    return booking as unknown as IBookingPopulated;
  };

  async updateExpiredBookings(): Promise<IBookingModel[]> {
    const now = new Date();
    const expiredBookings = await this._bookingModel.find({
      status: 'active',
      dropoffDateTime: { $lt: now },
    });

    await this._bookingModel.updateMany(
      { _id: { $in: expiredBookings.map(b => b._id) } },
      { $set: { status: 'completed' } }
    );

    return expiredBookings;
  }

  async getTotalBookingCount(): Promise<number> {
    return this._bookingModel.countDocuments();
  };

  async getAllRentalsForAdmin(page: number, limit: number, type: string, year: number, from: string, to: string): Promise<{ data: IBookingModel[]; total: number; }> {
    const pageNumber = Math.max(1, page);
    const pageSize = Math.max(1, limit);
    const skip = (pageNumber - 1) * pageSize;

    let filter: any = {};

    if (type === 'yearly') {
      filter.createdAt = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    } else if (type === 'monthly') {
      const month = 0; // update based on your input
      filter.createdAt = {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month + 1, 0, 23, 59, 59, 999),
      };
    } else if (type === 'custom' && from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    } else {
      throw new Error('Invalid filter type or missing required date range');
    }

    const data = await this._bookingModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate('ownerId')
      .populate('carId');
    const total = await this._bookingModel.countDocuments(filter);
    return { data, total }
  }

  async getSalesInformation(type: 'yearly' | 'monthly' | 'custom',
    year?: number,
    month?: number,
    from?: string,
    to?: string): Promise<BasicSalesInfo> {
    const match: any = {
      paymentStatus: 'completed'
    };

    if (type === 'yearly' && year) {
      match.createdAt = {
        $gte: new Date(`${year}-01-01T00:00:00Z`),
        $lte: new Date(`${year}-12-31T23:59:59Z`)
      };
    }

    if (type === 'monthly' && year && month) {
      const monthStr = String(month).padStart(2, '0');
      const start = new Date(`${year}-${monthStr}-01T00:00:00Z`);
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
      match.createdAt = { $gte: start, $lt: end };
    }

    if (type === 'custom' && from && to) {
      match.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const results = await this._bookingModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalPrice' },
          totalCommissionEarnings: { $sum: '$adminCommissionAmount' },
          totalOwnerEarnings: { $sum: '$ownerEarning' },
          totalDiscount: { $sum: { $ifNull: ['$discountAmount', 0] } },
          totalBookings: { $sum: 1 },
          premiumBookings: {
            $sum: {
              $cond: [{ $eq: ['$isPremiumBooking', true] }, 1, 0]
            }
          },
          refundedBookings: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0]
            }
          },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEarnings: 1,
          totalCommissionEarnings: 1,
          totalOwnerEarnings: 1,
          totalDiscount: 1,
          totalBookings: 1,
          premiumBookings: 1,
          refundedBookings: 1,
          averageOrderValue: 1
        }
      }
    ]);



    return {
      ...(results[0] || {
        totalEarnings: 0,
        totalCommissionEarnings: 0,
        totalOwnerEarnings: 0,
        totalDiscount: 0,
        totalBookings: 0,
        premiumBookings: 0,
        refundedBookings: 0,
        averageOrderValue: 0
      })
    };
  };
};