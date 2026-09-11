import { createZodDto } from "nestjs-zod";
import { createOfferSchema } from "@ustam/shared";

export class CreateOfferDto extends createZodDto(createOfferSchema) {}
