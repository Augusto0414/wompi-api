import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { createHash } from 'crypto';
import {
  AcceptanceToken,
  CreateTransactionRequest,
  PaymentGatewayPort,
  PaymentResult,
  TokenizeCardRequest,
  TokenizeCardResult,
  WompiTransactionResponse,
} from '../domain/payment-gateway.port';

@Injectable()
export class WompiAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiAdapter.name);
  private readonly httpClient: AxiosInstance;

  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = this.getRequiredConfig('wompi.publicKey');
    this.privateKey = this.getRequiredConfig('wompi.privateKey');
    this.integritySecret = this.getRequiredConfig('wompi.integritySecret');
    this.baseUrl = this.getRequiredConfig('wompi.apiUrl');

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
    return value;
  }

  async getAcceptanceToken(): Promise<AcceptanceToken> {
    try {
      const response = await this.httpClient.get<{
        data: {
          presigned_acceptance: {
            acceptance_token: string;
            permalink: string;
            type: string;
          };
        };
      }>(`/merchants/${this.publicKey}`);

      const { presigned_acceptance } = response.data.data;

      return {
        acceptanceToken: presigned_acceptance.acceptance_token,
        permalink: presigned_acceptance.permalink,
        type: presigned_acceptance.type,
      };
    } catch (error) {
      this.logger.error('Failed to get acceptance token', error);
      throw new Error('Failed to get acceptance token from Wompi');
    }
  }

  async tokenizeCard(
    request: TokenizeCardRequest,
  ): Promise<TokenizeCardResult> {
    try {
      const response = await this.httpClient.post<{
        status: string;
        data: {
          id: string;
          created_at: string;
          brand: string;
          name: string;
          last_four: string;
          bin: string;
          exp_year: string;
          exp_month: string;
          card_holder: string;
          expires_at: string;
        };
      }>(
        '/tokens/cards',
        {
          number: request.cardNumber,
          cvc: request.cvc,
          exp_month: request.expMonth,
          exp_year: request.expYear,
          card_holder: request.cardHolder,
        },
        {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        },
      );

      const { data } = response.data;

      return {
        success: true,
        tokenId: data.id,
        brand: data.brand,
        lastFour: data.last_four,
        expiresAt: data.expires_at,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error: { messages: string[] } }>;
      const errorMessage =
        axiosError.response?.data?.error?.messages?.join(', ') ??
        'Card tokenization failed';

      this.logger.error('Card tokenization failed', errorMessage);

      return {
        success: false,
        errorMessage,
      };
    }
  }

  async pay(
    amountInCents: number,
    cardToken: string,
    customerEmail?: string,
  ): Promise<PaymentResult> {
    try {
      // First, get acceptance token
      const acceptanceData = await this.getAcceptanceToken();

      // Create the transaction
      const reference = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const currency = 'COP';

      // Generate integrity signature: SHA256(reference + amount + currency + integritySecret)
      const signature = this.generateIntegritySignature(
        reference,
        amountInCents,
        currency,
      );

      const transactionRequest: CreateTransactionRequest = {
        amount_in_cents: amountInCents,
        currency,
        customer_email: customerEmail ?? 'customer@test.com',
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: 1,
        },
        reference,
        acceptance_token: acceptanceData.acceptanceToken,
        signature,
      };

      const response = await this.httpClient.post<{
        data: WompiTransactionResponse;
      }>('/transactions', transactionRequest, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      });

      const transaction = response.data.data;

      // Check transaction status
      if (transaction.status === 'APPROVED') {
        return {
          success: true,
          wompiTransactionId: transaction.id,
          status: transaction.status,
        };
      }

      // For PENDING status, poll for final status
      if (transaction.status === 'PENDING') {
        const finalStatus = await this.pollTransactionStatus(transaction.id);
        return {
          success: finalStatus.status === 'APPROVED',
          wompiTransactionId: transaction.id,
          status: finalStatus.status,
          errorMessage:
            finalStatus.status !== 'APPROVED'
              ? finalStatus.status_message
              : undefined,
        };
      }

      return {
        success: false,
        wompiTransactionId: transaction.id,
        status: transaction.status,
        errorMessage: transaction.status_message ?? 'Payment declined',
      };
    } catch (error) {
      const axiosError = error as AxiosError<{
        error: { type: string; messages: Record<string, string[]> };
      }>;

      let errorMessage = 'Payment processing failed';
      if (axiosError.response?.data?.error) {
        const messages = axiosError.response.data.error.messages;
        errorMessage = Object.values(messages).flat().join(', ');
      }

      this.logger.error('Payment failed', {
        error: axiosError.response?.data ?? axiosError.message,
      });

      return {
        success: false,
        errorMessage,
      };
    }
  }

  private async pollTransactionStatus(
    transactionId: string,
    maxAttempts = 10,
    delayMs = 2000,
  ): Promise<WompiTransactionResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.delay(delayMs);

      try {
        const response = await this.httpClient.get<{
          data: WompiTransactionResponse;
        }>(`/transactions/${transactionId}`);

        const transaction = response.data.data;

        if (transaction.status !== 'PENDING') {
          return transaction;
        }
      } catch {
        this.logger.warn(
          `Failed to poll transaction status (attempt ${attempt + 1})`,
        );
      }
    }

    return {
      id: transactionId,
      status: 'PENDING',
      status_message: 'Transaction status could not be confirmed',
    } as WompiTransactionResponse;
  }

  async getTransactionStatus(
    transactionId: string,
  ): Promise<WompiTransactionResponse | null> {
    try {
      const response = await this.httpClient.get<{
        data: WompiTransactionResponse;
      }>(`/transactions/${transactionId}`);

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction ${transactionId}`, error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generates the integrity signature for Wompi transactions
   * Formula: SHA256(reference + amountInCents + currency + integritySecret)
   */
  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const dataToSign = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return createHash('sha256').update(dataToSign).digest('hex');
  }
}
