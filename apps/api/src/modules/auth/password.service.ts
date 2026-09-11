import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";

/** Şifre hash'leme — argon2id + pepper. */
@Injectable()
export class PasswordService {
  private readonly pepper: string;

  constructor(config: ConfigService) {
    this.pepper = config.get<string>("security.passwordPepper") ?? "";
  }

  hash(plain: string): Promise<string> {
    return argon2.hash(plain + this.pepper, { type: argon2.argon2id });
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain + this.pepper);
  }
}
