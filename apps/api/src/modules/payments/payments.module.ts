import { Controller, Get, Module, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentProvider } from "./payment-provider";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("payments")
class PaymentsController {
  constructor(private payments: PaymentsService) {}

  /** Kabul edilen teklif için ödemeyi emanete al. */
  @Post("offer/:offerId/pay")
  pay(@CurrentUser() user: AuthUser, @Param("offerId") offerId: string) {
    return this.payments.pay(offerId, user.id);
  }

  /** İş onayı → emanetten ustaya aktar. */
  @Post("offer/:offerId/release")
  release(@CurrentUser() user: AuthUser, @Param("offerId") offerId: string) {
    return this.payments.release(offerId, user.id);
  }

  /** İptal/anlaşmazlık → iade. */
  @Post("offer/:offerId/refund")
  refund(@CurrentUser() user: AuthUser, @Param("offerId") offerId: string) {
    return this.payments.refund(offerId, user.id);
  }

  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.payments.list(user.id);
  }
}

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
