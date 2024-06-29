import * as Stripe from 'stripe';

export class CreateChargeDto {
  card: Stripe.Stripe.PaymentMethodCreateParams.Card;
  amount: number;
}
