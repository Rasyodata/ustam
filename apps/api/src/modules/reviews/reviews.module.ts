import { Body, Controller, Get, Injectable, Module, Param, Post } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { createReviewSchema, CreateReviewInput, ReviewDirection } from "@ustam/shared";

class CreateReviewDto extends createZodDto(createReviewSchema) {}

@Injectable()
class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /** İş tamamlandıktan sonra karşı tarafı puanla; sağlayıcı ortalamasını güncelle. */
  async create(authorId: string, input: CreateReviewInput) {
    const listing = await this.prisma.listing.findUniqueOrThrow({
      where: { id: input.listingId },
      include: { offers: { where: { status: "ACCEPTED" }, take: 1 } },
    });
    const acceptedProviderId = listing.offers[0]?.providerId;
    const isOwner = listing.ownerId === authorId;
    const direction: ReviewDirection = isOwner
      ? ReviewDirection.CUSTOMER_TO_PROVIDER
      : ReviewDirection.PROVIDER_TO_CUSTOMER;
    const targetId = isOwner ? acceptedProviderId! : listing.ownerId;

    const review = await this.prisma.review.create({
      data: {
        listingId: input.listingId,
        authorId,
        targetId,
        direction,
        rating: input.rating,
        comment: input.comment,
      },
    });

    // Sağlayıcı profil ortalamasını tazele
    if (direction === ReviewDirection.CUSTOMER_TO_PROVIDER) {
      const agg = await this.prisma.review.aggregate({
        where: { targetId, direction: ReviewDirection.CUSTOMER_TO_PROVIDER },
        _avg: { rating: true },
        _count: true,
      });
      await this.prisma.providerProfile.updateMany({
        where: { userId: targetId },
        data: {
          avgRating: agg._avg.rating ?? 0,
          reviewCount: agg._count,
          completedJobs: { increment: 1 },
        },
      });
    }
    return review;
  }

  listForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { displayName: true } } },
    });
  }
}

@Controller("reviews")
class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Public()
  @Get("user/:userId")
  forUser(@Param("userId") userId: string) {
    return this.reviews.listForUser(userId);
  }
}

@Module({ controllers: [ReviewsController], providers: [ReviewsService] })
export class ReviewsModule {}
