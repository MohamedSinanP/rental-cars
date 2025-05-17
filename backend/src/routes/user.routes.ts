import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { bookingController, carController, reviewController, subscriptionController, userController, wishlistController } from "../di/container";
import { attachUserIfExists } from "../middlewares/attachUserIfExist";
const router = express.Router();


router.get('/profile', authenticate(['user']), userController.fetchUser.bind(userController));
router.get('/details', authenticate(['user']), userController.getUserDetails.bind(userController));
router.get('/cars', attachUserIfExists, carController.getAllCars.bind(carController));
router.get('/car-details/:id', carController.carDetails.bind(carController));
router.get('/cars/similar/:id', carController.similarCars.bind(carController));
router.get('/reverse-geocode', userController.fetchUserLocationAddress.bind(userController));
router.patch('/location/:id', userController.setUserLocation.bind(userController));
router.get('/wallet', authenticate(["user"]), userController.getUserWallet.bind(userController));
router.put('/update-profile', authenticate(["user"]), userController.updateProfile.bind(userController));
router.put('/update-password', authenticate(["user"]), userController.updatePassword.bind(userController));
router.patch('/update-profile-pic', authenticate(["user"]), userController.uploadImage.bind(userController));
router.post('/add-review/:id', authenticate(["user"]), reviewController.addReview.bind(reviewController));
router.get('/get-reviews/:id', reviewController.getAllCarReview.bind(reviewController));


// booking related routes
router.post('/book-car', authenticate(['user']), bookingController.creatBooking.bind(bookingController));
router.get('/rentals', authenticate(['user']), bookingController.fetchUserRentals.bind(bookingController));
router.get('/addresses', authenticate(['user']), userController.fetchUserAddresses.bind(userController));
router.get('/latest-booking/:id', authenticate(['user']), bookingController.getLatestBooking.bind(bookingController));
router.patch('/cancel-booking/:id', authenticate(['user']), bookingController.cancelBooking.bind(bookingController));
router.get('/invoice/:id', authenticate(['user']), bookingController.invoiceForUser.bind(bookingController));

// subscription related routes
router.get('/subscriptions', subscriptionController.getActiveSubscriptions.bind(subscriptionController));
router.get('/subscription', authenticate(["user"]), subscriptionController.getUserSubscription.bind(subscriptionController));
router.post('/create-subscription', authenticate(["user"]), subscriptionController.makeSubscription.bind(subscriptionController));
router.post('/webhook', subscriptionController.handleWebhook.bind(subscriptionController));
router.get('/subscriptions/all-stats', authenticate(["user"]), subscriptionController.getUserAllSubscriptions.bind(subscriptionController));
router.patch('/subscriptions/:id/cancel', authenticate(["user"]), subscriptionController.cancelUserSub.bind(subscriptionController));
router.get('/subscriptions/active', authenticate(["user"]), subscriptionController.getUserActiveSub.bind(subscriptionController));

// wishlist related routes
router.post('/wishlist', authenticate(["user"]), wishlistController.addToWishlist.bind(wishlistController));
router.delete('/wishlist/:id', authenticate(["user"]), wishlistController.removeFromWishlist.bind(wishlistController));
router.get('/wishlist', authenticate(["user"]), wishlistController.getWishlist.bind(wishlistController));
router.get('/wishlist/paginated', authenticate(["user"]), wishlistController.getUserWishlist.bind(wishlistController));


export default router;
