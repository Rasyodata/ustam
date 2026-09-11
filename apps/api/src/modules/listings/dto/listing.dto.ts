import { createZodDto } from "nestjs-zod";
import { createListingSchema, searchListingsSchema } from "@ustam/shared";

export class CreateListingDto extends createZodDto(createListingSchema) {}
export class SearchListingsDto extends createZodDto(searchListingsSchema) {}
