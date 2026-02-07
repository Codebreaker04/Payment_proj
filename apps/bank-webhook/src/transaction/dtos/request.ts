export enum PaymentMethod {
  P2P = 'P2P',
  UPI = 'UPI',
  CARD = 'CARD',
  INTERNAL = 'INTERNAL',
}

export class InitiateTransactionRequestDto {
  amount: number;
  paymentMethod: PaymentMethod;
  currency: string;
  idempotencyKey: string;
  description?: string;
}

export class P2PTransactionRequestDto extends InitiateTransactionRequestDto {
  receiverId: string;
}

export class UPITransactionRequestDto extends InitiateTransactionRequestDto {
  vpa: string;
}

export class CardTransactionRequestDto extends InitiateTransactionRequestDto {
  cardNumber: string;
  expiryDate: string;
  expiryMonth: string;
  cvv: string;
}

export class InternalTransactionRequestDto extends InitiateTransactionRequestDto {
  systemAccountId: string;
}
