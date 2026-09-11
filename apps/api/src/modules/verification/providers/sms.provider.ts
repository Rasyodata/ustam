import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * SMS gönderimi. Varsayılan 'mock' (log'a yazar).
 * Prod: Netgsm / Twilio gibi sağlayıcı adapterı buraya eklenir.
 */
@Injectable()
export class SmsProvider {
  private readonly logger = new Logger("SMS");
  private readonly provider: string;

  constructor(private config: ConfigService) {
    this.provider = this.config.get<string>("sms.provider") ?? "mock";
  }

  async sendOtp(phone: string, code: string) {
    const text = `Ustam dogrulama kodunuz: ${code}`;
    await this.send(phone, text);
  }

  async send(phone: string, text: string) {
    switch (this.provider) {
      case "mock":
        this.logger.log(`📱 [MOCK SMS] ${phone} → "${text}"`);
        return;
      // case "netgsm": return this.sendNetgsm(phone, text);
      // case "twilio": return this.sendTwilio(phone, text);
      default:
        this.logger.warn(`Bilinmeyen SMS sağlayıcı: ${this.provider}`);
    }
  }
}
