import { Module } from "@nestjs/common";
import { VerificationService } from "./verification.service";
import { VerificationController } from "./verification.controller";
import { MailProvider } from "./providers/mail.provider";
import { SmsProvider } from "./providers/sms.provider";

@Module({
  controllers: [VerificationController],
  providers: [VerificationService, MailProvider, SmsProvider],
  exports: [VerificationService, MailProvider, SmsProvider],
})
export class VerificationModule {}
