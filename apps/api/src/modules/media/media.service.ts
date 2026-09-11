import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { MediaType } from "@ustam/shared";

const ALLOWED_MIME: Record<string, MediaType> = {
  "image/jpeg": MediaType.IMAGE,
  "image/png": MediaType.IMAGE,
  "image/webp": MediaType.IMAGE,
  "application/pdf": MediaType.DOCUMENT,
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const s3 = this.config.get("s3")!;
    this.bucket = s3.bucket;
    this.publicUrl = s3.publicUrl ?? `${s3.endpoint}/${s3.bucket}`;
    this.s3 = new S3Client({
      endpoint: s3.endpoint,
      region: s3.region,
      forcePathStyle: true, // MinIO
      credentials: { accessKeyId: s3.accessKey, secretAccessKey: s3.secretKey },
    });
  }

  /**
   * İstemciye doğrudan S3'e yüklemesi için imzalı PUT URL'i üretir.
   * MIME ve boyut kontrolü; ardından medya kaydı 'beklemede' oluşturulur.
   */
  async createUploadUrl(ownerId: string, mime: string, size: number) {
    const type = ALLOWED_MIME[mime];
    if (!type) {
      return { error: "unsupported_type" } as const;
    }
    if (size > MAX_SIZE) {
      return { error: "too_large" } as const;
    }
    const ext = mime.split("/")[1];
    const key = `uploads/${ownerId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: mime });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });

    const media = await this.prisma.media.create({
      data: {
        ownerId,
        type,
        key,
        url: `${this.publicUrl}/${key}`,
        mime,
        size,
      },
    });

    return { mediaId: media.id, uploadUrl, publicUrl: media.url, expiresIn: 300 } as const;
  }

  get(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }
}
