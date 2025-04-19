import express from 'express';
import { paymentController } from '../di/container';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/intent', authenticate(["user"]), paymentController.createPaymentIntent.bind(paymentController));

export default router;