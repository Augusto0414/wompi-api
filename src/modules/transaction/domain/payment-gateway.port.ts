export interface PaymentResult {
  success: boolean;
  wompiTransactionId?: string;
  status?: string;
  errorMessage?: string;
}

export interface AcceptanceToken {
  acceptanceToken: string;
  permalink: string;
  type: string;
}

export interface TokenizeCardRequest {
  cardNumber: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface TokenizeCardResult {
  success: boolean;
  tokenId?: string;
  brand?: string;
  lastFour?: string;
  expiresAt?: string;
  errorMessage?: string;
}

export interface CreateTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  reference: string;
  acceptance_token: string;
}

export interface WompiTransactionResponse {
  id: string;
  created_at?: string;
  amount_in_cents?: number;
  reference?: string;
  customer_email?: string;
  currency?: string;
  payment_method_type?: string;
  payment_method?: {
    type: string;
    extra: {
      brand: string;
      last_four: string;
    };
  };
  status: string;
  status_message?: string;
  finalized_at?: string;
}

export interface PaymentGatewayPort {
  pay(
    amountInCents: number,
    cardToken: string,
    customerEmail?: string,
  ): Promise<PaymentResult>;
  getAcceptanceToken(): Promise<AcceptanceToken>;
  tokenizeCard(request: TokenizeCardRequest): Promise<TokenizeCardResult>;
  getTransactionStatus(
    transactionId: string,
  ): Promise<WompiTransactionResponse | null>;
}
