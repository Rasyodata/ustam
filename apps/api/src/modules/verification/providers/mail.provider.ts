import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Locale } from "@ustam/shared";

/** E-posta gönderimi (dev: Mailhog, prod: SMTP). */
@Injectable()
export class MailProvider {
  private readonly logger = new Logger("Mail");
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private config: ConfigService) {
    const mail = this.config.get("mail")!;
    this.from = mail.from;
    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: false,
      auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
    });
  }

  async sendOtp(to: string, code: string, _locale: Locale) {
    const html = `<div style="font-family:sans-serif">
      <h2>Ustam</h2>
      <p>Doğrulama kodunuz / Your code:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p style="color:#888">Bu kod 5 dakika geçerlidir.</p>
    </div>`;
    await this.send(to, "Ustam — Doğrulama Kodu", html);
  }

  async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (e) {
      this.logger.error(`Mail gönderilemedi: ${(e as Error).message}`);
    }
  }
}
