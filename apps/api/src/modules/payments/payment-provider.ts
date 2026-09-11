import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ChargeResult {
  success: boolean;
  providerRef: string;
  provider: string;
}

/**
 * Ödeme sağlayıcı soyutlaması.
 * Varsayılan 'mock' (her zaman başarılı, gerçek tahsilat yok).
 * Prod: iyzico / Stripe adapter'ı buraya eklenir (3D Secure, webhook doğrulama).
 */
@Injectable()
export class PaymentProvider {
  private readonly logger = new Logger("Payment");
  private readonly provider: string;

  constructor(config: ConfigService) {
    this.provider = config.get<string>("payment.provider") ?? "mock";
  }

  async charge(amount: number, currency: string, _meta: Record<string, unknown>): Promise<ChargeResult> {
    switch (this.provider) {
      case "mock":
        this.logger.log(`💳 [MOCK] ${amount} ${currency} tahsil edildi (emanete alındı)`);
        return { success: true, providerRef: `mock_${Date.now()}`, provider: "mock" };
      // case "iyzico": return this.chargeIyzico(...)
      // case "stripe": return this.chargeStripe(...)
      default:
        return { success: false, providerRef: "", provider: this.provider };
    }
  }

  async payout(amount: number, currency: string, _payeeRef: string): Promise<ChargeResult> {
    this.logger.log(`💸 [${this.provider}] ${amount} ${currency} ustaya aktarıldı`);
    return { success: true, providerRef: `payout_${Date.now()}`, provider: this.provider };
  }

  async refund(providerRef: string): Promise<ChargeResult> {
    this.logger.log(`↩️ [${this.provider}] iade: ${providerRef}`);
    return { success: true, providerRef: `refund_${Date.now()}`, provider: this.provider };
  }
}
