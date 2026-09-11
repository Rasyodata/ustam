import { BadRequestException, Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { MediaService } from "./media.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("media")
class MediaController {
  constructor(private media: MediaService) {}

  /** İmzalı yükleme URL'i iste. İstemci dosyayı doğrudan S3'e PUT eder. */
  @Post("upload-url")
  async uploadUrl(
    @CurrentUser() user: AuthUser,
    @Body() body: { mime: string; size: number },
  ) {
    const result = await this.media.createUploadUrl(user.id, body.mime, body.size);
    if ("error" in result) {
      throw new BadRequestException({ code: result.error!.toUpperCase(), message: "errors.generic" });
    }
    return result;
  }

  @Public()
  @Get(":id")
  get(@Param("id") id: string) {
    return this.media.get(id);
  }
}

@Module({ controllers: [MediaController], providers: [MediaService], exports: [MediaService] })
export class MediaModule {}
