import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Server, Socket } from "socket.io";

/**
 * Gerçek zamanlı mesaj/bildirim gateway'i (Socket.IO).
 * İstemci handshake'te { auth: { token } } ile bağlanır.
 * Kullanıcı kendi `user:<id>` odasına, konuşmalar `conv:<id>` odasına katılır.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MessagingGateway implements OnGatewayConnection {
  private readonly logger = new Logger("WS");
  @WebSocketServer() server!: Server;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      const payload = await this.jwt.verifyAsync(token ?? "", {
        secret: this.config.get<string>("jwt.accessSecret"),
      });
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch {
      this.logger.warn("WS kimlik doğrulanamadı, bağlantı kapatılıyor");
      client.disconnect();
    }
  }

  @SubscribeMessage("join")
  onJoin(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.join(`conv:${conversationId}`);
    return { joined: conversationId };
  }

  @SubscribeMessage("typing")
  onTyping(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.to(`conv:${conversationId}`).emit("typing", { userId: client.data.userId });
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  emitToConversation(conversationId: string, event: string, payload: unknown) {
    this.server?.to(`conv:${conversationId}`).emit(event, payload);
  }
}
