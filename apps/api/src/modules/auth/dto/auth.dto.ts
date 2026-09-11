import { createZodDto } from "nestjs-zod";
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  otpVerifySchema,
} from "@ustam/shared";

/** Paylaşılan zod şemalarından NestJS DTO'ları. Tek doğrulama kaynağı. */
export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class RequestOtpDto extends createZodDto(requestOtpSchema) {}
export class VerifyOtpDto extends createZodDto(otpVerifySchema) {}
