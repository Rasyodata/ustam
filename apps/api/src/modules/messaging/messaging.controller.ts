import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { MessagingGateway } from "./messaging.gateway";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("conversations")
export class MessagingController {
  constructor(
    private messaging: MessagingService,
    private gateway: MessagingGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.messaging.listConversations(user.id);
  }

  @Post()
  open(
    @CurrentUser() user: AuthUser,
    @Body() body: { listingId: string; customerId: string; providerId: string },
  ) {
    return this.messaging.openConversation(body.listingId, body.customerId, body.providerId, user.id);
  }

  @Get(":id/messages")
  messages(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messaging.messages(id, user.id);
  }

  @Post(":id/messages")
  async send(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("body") body: string) {
    const { message, recipientId } = await this.messaging.sendMessage(id, user.id, body);
    // Canlı yayınla
    this.gateway.emitToUser(recipientId, "message", message);
    this.gateway.emitToConversation(id, "message", message);
    return message;
  }

  @Patch(":id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messaging.markRead(id, user.id);
  }
}
