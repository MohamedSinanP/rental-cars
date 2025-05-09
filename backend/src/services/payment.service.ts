import IPaymentService from "../interfaces/services/payment.service";
import stripe from "../config/stripe";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";

export default class PaymentService implements IPaymentService {
  constructor() { };

  async createPaymentIntentService(amount: number): Promise<{
    clientSecret: string,
    paymentId: string
  }> {
    if (!amount) {
      throw new HttpError(StatusCode.BAD_REQUEST, 'Amount is required');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      payment_method_types: ['card'],
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: paymentIntent.id,
    };
  }
}