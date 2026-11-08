import type { Announcement } from "../../../types/service.types.js";
import { BaseResourceSyncer } from "./base.js";
import { fetchAnnouncements } from "../../../api/services/ktu/index.js";
import { AnnouncementsRepository } from "../../../db/repositories/announcements-repository.js";
import { announcements } from "../../../db/schema/announcements.js";
import type { DatabaseInstance } from "../../../db/types.js";
import { enrichAndClassifySyncedAnnouncements } from "./announcements-enricher.js";
import logger from "../../../utils/logger.js";

type AnnouncementInsert = typeof announcements.$inferInsert;

export class AnnouncementsSyncer extends BaseResourceSyncer<
  Announcement,
  AnnouncementInsert
> {
  readonly name = "announcements";
  protected readonly pageSize = 100;
  protected readonly batchSize = 20;

  protected fetchPage(pageNumber: number): Promise<Announcement[]> {
    return fetchAnnouncements({
      pageNumber,
      dataSize: this.pageSize,
      apiClient: this.apiClient,
    });
  }

  protected transformFromApi(item: Announcement): AnnouncementInsert {
    return AnnouncementsRepository.transformFromApi(item);
  }

  protected createRepo(dbInstance: DatabaseInstance) {
    return new AnnouncementsRepository(dbInstance);
  }

  override async performPeriodicSync(): Promise<void> {
    await super.performPeriodicSync();

    try {
      const recent1 = await this.fetchPage(0);
      const recent2 = await this.fetchPage(1);
      const recent = [...recent1, ...recent2];
      if (recent.length > 0) {
        await enrichAndClassifySyncedAnnouncements(recent, this.db);
      }
    } catch (enrichErr) {
      logger.warn({ err: enrichErr }, "Announcement enrichment step encountered an issue");
    }
  }
}
