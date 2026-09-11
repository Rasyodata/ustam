import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeiliSearch, Index } from "meilisearch";
import { SEARCH_INDEX } from "@ustam/shared";

export interface ListingDocument {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  cityId: string;
  cityName: string;
  urgency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  createdAt: number;
}

/**
 * Meilisearch entegrasyonu — hızlı, typo-toleranslı, çok dilli full-text arama.
 * Meili erişilemezse uygulama çökmesin diye tüm çağrılar hata-toleranslıdır.
 */
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger("Search");
  private client: MeiliSearch;
  private enabled = true;

  constructor(private config: ConfigService) {
    const meili = this.config.get("meili")!;
    this.client = new MeiliSearch({ host: meili.host, apiKey: meili.masterKey });
  }

  private get listings(): Index<ListingDocument> {
    return this.client.index<ListingDocument>(SEARCH_INDEX.LISTINGS);
  }

  async onModuleInit() {
    try {
      await this.listings.updateSettings({
        searchableAttributes: ["title", "description", "cityName"],
        filterableAttributes: ["categoryId", "cityId", "urgency", "status", "budgetMin", "budgetMax"],
        sortableAttributes: ["createdAt", "budgetMin", "budgetMax"],
      });
      this.logger.log("Meilisearch index ayarlandı");
    } catch (e) {
      this.enabled = false;
      this.logger.warn(`Meilisearch erişilemedi, arama DB fallback ile çalışacak: ${(e as Error).message}`);
    }
  }

  async indexListing(doc: ListingDocument) {
    if (!this.enabled) return;
    try {
      await this.listings.addDocuments([doc], { primaryKey: "id" });
    } catch (e) {
      this.logger.warn(`indexListing hata: ${(e as Error).message}`);
    }
  }

  async removeListing(id: string) {
    if (!this.enabled) return;
    await this.listings.deleteDocument(id).catch(() => void 0);
  }

  /** Meili araması; kapalıysa null döner → çağıran DB araması yapar. */
  async searchListings(
    q: string,
    opts: { filter?: string[]; sort?: string[]; limit: number; offset: number },
  ) {
    if (!this.enabled) return null;
    try {
      return await this.listings.search(q, {
        filter: opts.filter,
        sort: opts.sort,
        limit: opts.limit,
        offset: opts.offset,
      });
    } catch {
      return null;
    }
  }
}
