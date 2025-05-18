import {
  BookingDTO,
  IBookingModel
} from "../types/booking";
import {
  CarDTO,
  ICarModel
} from "../types/car";
import {
  IOwnerModel,
  OwnerResponseDTO
} from "../types/owner";
import {
  AddressDTO,
  IAddressModel,
  IReviewModel,
  ISubscriptionModel,
  IUserModel,
  IUserSubscriptionModel,
  IWishlistModel,
  ReviewDTO,
  SubscriptionDTO,
  UserResponseDTO,
  UserSubDTO,
  WishlistDTO
} from "../types/user";

// -------------- Booking DTO ------------------

export function toBookingDTO(booking: IBookingModel): BookingDTO {
  return {
    id: booking._id.toString(),
    userId: isPopulatedUser(booking.userId) ? toUserDTO(booking.userId) : booking.userId.toString(),
    carId: isPopulatedCar(booking.carId) ? mapToCarDTO(booking.carId) : booking.carId.toString(),
    ownerId: isPopulatedOwner(booking.ownerId) ? toOwnerResponseDTO(booking.ownerId) : booking.ownerId.toString(),
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    pickupDateTime: booking.pickupDateTime,
    dropoffDateTime: booking.dropoffDateTime,
    totalPrice: booking.totalPrice,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    status: booking.status ?? 'active',
    commissionPercentage: booking.commissionPercentage,
    adminCommissionAmount: booking.adminCommissionAmount,
    ownerEarning: booking.ownerEarning,
    userDetails: booking.userDetails,
  };
}

// -------------- Car DTO ------------------

export function mapToCarDTO(car: ICarModel): CarDTO {
  return {
    id: car._id.toString(),
    carName: car.carName,
    carModel: car.carModel,
    carType: car.carType,
    seats: car.seats,
    transmission: car.transmission,
    fuelType: car.fuelType,
    fuelOption: car.fuelOption,
    ownerId: isPopulatedOwner(car.ownerId) ? toOwnerResponseDTO(car.ownerId) : car.ownerId.toString(),
    carImages: car.carImages,
    rcDoc: car.rcDoc,
    pucDoc: car.pucDoc,
    insuranceDoc: car.insuranceDoc,
    location: {
      type: car.location.type,
      coordinates: car.location.coordinates,
      address: car.location.address
    },
    status: car.status,
    isVerified: car.isVerified,
    verificationRejected: car.verificationRejected,
    features: car.features,
    pricePerHour: car.pricePerHour,
    deposit: car.deposit,
    lastmaintenanceDate: car.lastmaintenanceDate,
    maintenanceInterval: car.maintenanceInterval,
    isListed: car.isListed,
    distance: car.distance
  };
}

// -------------- Owner DTO ------------------

export function toOwnerResponseDTO(owner: IOwnerModel): OwnerResponseDTO {
  return {
    id: owner._id?.toString(),
    userName: owner.userName,
    email: owner.email,
    role: owner.role,
    isBlocked: owner.isBlocked ?? false,
    isVerified: owner.isVerified ?? false,
    commission: owner.commission ?? 0,
  };
}

// -------------- Review DTO ------------------

export function toReviewResponseDTO(review: IReviewModel): ReviewDTO {
  return {
    id: review._id.toString(),
    userId: isPopulatedUser(review.userId) ? toUserDTO(review.userId) : review.userId.toString(),
    carId: isPopulatedCar(review.carId) ? mapToCarDTO(review.carId) : review.carId.toString(),
    rating: review.rating,
    comment: review.comment
  };
}

// -------------- Subscription DTO ------------------

export function toSubscriptionDTO(sub: ISubscriptionModel): SubscriptionDTO {
  return {
    id: sub._id.toString(),
    name: sub.name,
    description: sub.description,
    features: sub.features,
    stripeProductId: sub.stripeProductId,
    stripePriceId: sub.stripePriceId,
    price: sub.price,
    billingCycle: sub.billingCycle,
    isActive: sub.isActive
  };
}

// -------------- User Subscription DTO ------------------

export function toUserSubscriptionDTO(userSub: IUserSubscriptionModel): UserSubDTO {
  return {
    id: userSub._id.toString(),
    userId: isPopulatedUser(userSub.userId)
      ? toUserDTO(userSub.userId)
      : userSub.userId.toString(),
    subscriptionId: isPopulatedSubscription(userSub.subscriptionId)
      ? toSubscriptionDTO(userSub.subscriptionId)
      : userSub.subscriptionId.toString(),
    stripeSubscriptionId: userSub.stripeSubscriptionId,
    status: userSub.status,
    currentPeriodStart: userSub.currentPeriodStart,
    currentPeriodEnd: userSub.currentPeriodEnd,
  };
}

// -------------- User DTO ------------------

export function toUserDTO(user: IUserModel): UserResponseDTO {
  return {
    id: user._id.toString(),
    userName: user.userName,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    isVerified: user.isVerified,
  };
}

// -------------- Address DTO ------------------

export function toAddressDTO(address: IAddressModel): AddressDTO {
  return {
    id: address._id.toString(),
    name: address.name,
    userId: isPopulatedUser(address.userId) ? toUserDTO(address.userId) : address.userId.toString(),
    email: address.email,
    phoneNumber: address.phoneNumber,
    address: address.address,
  };
}

// -------------- Wishlist DTO ------------------

export function toWishlistDTO(wishlist: IWishlistModel): WishlistDTO {
  return {
    id: wishlist._id.toString(),
    userId: isPopulatedUser(wishlist.userId) ? toUserDTO(wishlist.userId) : wishlist.userId.toString(),
    cars: wishlist.cars.map((item) => ({
      car: isPopulatedCar(item.car) ? mapToCarDTO(item.car) : item.car.toString(),
      addedAt: item.addedAt
    })),
  };
}

// ------------------- Type Guards --------------------

function isPopulatedUser(user: any): user is IUserModel {
  return user && typeof user === "object" && "email" in user && "userName" in user;
}

function isPopulatedCar(car: any): car is ICarModel {
  return car && typeof car === "object" && "carName" in car && "carModel" in car;
}

function isPopulatedOwner(owner: any): owner is IOwnerModel {
  return owner && typeof owner === "object" && "email" in owner && "userName" in owner;
}
function isPopulatedSubscription(sub: any): sub is ISubscriptionModel {
  return sub && typeof sub === 'object' && 'name' in sub && 'stripePriceId' in sub;
}