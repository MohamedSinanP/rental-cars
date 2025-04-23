export default interface IPaymentService {
  createPaymentIntentService(amount: number): Promise<{
    clientSecret: string,
    paymentId: string
  }
  >;
}