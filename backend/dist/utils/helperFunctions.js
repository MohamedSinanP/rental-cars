"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBookingDTO = toBookingDTO;
exports.mapToCarDTO = mapToCarDTO;
exports.toOwnerResponseDTO = toOwnerResponseDTO;
exports.toReviewResponseDTO = toReviewResponseDTO;
exports.toSubscriptionDTO = toSubscriptionDTO;
exports.toUserSubscriptionDTO = toUserSubscriptionDTO;
exports.toUserDTO = toUserDTO;
exports.toAddressDTO = toAddressDTO;
exports.toWishlistDTO = toWishlistDTO;
// -------------- Booking DTO ------------------
function toBookingDTO(booking) {
    var _a;
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
        status: (_a = booking.status) !== null && _a !== void 0 ? _a : 'active',
        commissionPercentage: booking.commissionPercentage,
        adminCommissionAmount: booking.adminCommissionAmount,
        ownerEarning: booking.ownerEarning,
        userDetails: booking.userDetails,
    };
}
// -------------- Car DTO ------------------
function mapToCarDTO(car) {
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
function toOwnerResponseDTO(owner) {
    var _a, _b, _c, _d;
    return {
        id: (_a = owner._id) === null || _a === void 0 ? void 0 : _a.toString(),
        userName: owner.userName,
        email: owner.email,
        role: owner.role,
        isBlocked: (_b = owner.isBlocked) !== null && _b !== void 0 ? _b : false,
        isVerified: (_c = owner.isVerified) !== null && _c !== void 0 ? _c : false,
        commission: (_d = owner.commission) !== null && _d !== void 0 ? _d : 0,
    };
}
// -------------- Review DTO ------------------
function toReviewResponseDTO(review) {
    return {
        id: review._id.toString(),
        userId: isPopulatedUser(review.userId) ? toUserDTO(review.userId) : review.userId.toString(),
        carId: isPopulatedCar(review.carId) ? mapToCarDTO(review.carId) : review.carId.toString(),
        rating: review.rating,
        comment: review.comment
    };
}
// -------------- Subscription DTO ------------------
function toSubscriptionDTO(sub) {
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
function toUserSubscriptionDTO(userSub) {
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
function toUserDTO(user) {
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
function toAddressDTO(address) {
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
function toWishlistDTO(wishlist) {
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
function isPopulatedUser(user) {
    return user && typeof user === "object" && "email" in user && "userName" in user;
}
function isPopulatedCar(car) {
    return car && typeof car === "object" && "carName" in car && "carModel" in car;
}
function isPopulatedOwner(owner) {
    return owner && typeof owner === "object" && "email" in owner && "userName" in owner;
}
function isPopulatedSubscription(sub) {
    return sub && typeof sub === 'object' && 'name' in sub && 'stripePriceId' in sub;
}
