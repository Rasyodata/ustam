import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PushService } from "../push/push.module";

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  /** İlan sahibi ile usta arasında konuşma aç (yoksa oluştur). */
  async openConversation(listingId: string, customerId: string, providerId: string, requesterId: string) {
    if (requesterId !== customerId && requesterId !== providerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return this.prisma.conversation.upsert({
      where: { listingId_customerId_providerId: { listingId, customerId, providerId } },
      update: {},
      create: { listingId, customerId, providerId },
    });
  }

  async listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ customerId: userId }, { providerId: userId }] },
      orderBy: { lastMessageAt: "desc" },
      include: {
        listing: { select: { id: true, title: true } },
        customer: { select: { id: true, displayName: true, avatarUrl: true } },
        provider: { select: { id: true, displayName: true, avatarUrl: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });
  }

  async messages(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
  }

  /** Mesaj gönder → DB'ye yaz, konuşma zamanını güncelle, alıcıya bildirim. */
  async sendMessage(conversationId: string, senderId: string, body: string) {
    const conv = await this.assertMember(conversationId, senderId);
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { conversationId, senderId, body } }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);
    const recipientId = conv.customerId === senderId ? conv.providerId : conv.customerId;
    await this.prisma.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        titleKey: "notifications.newMessage",
        data: { conversationId, messageId: message.id },
      },
    });
    await this.push.sendToUser(recipientId, "Ustam", body.slice(0, 120), {
      conversationId,
      messageId: message.id,
    });
    return { message, recipientId };
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);
    return this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  private async assertMember(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (conv.customerId !== userId && conv.providerId !== userId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return conv;
  }
}
