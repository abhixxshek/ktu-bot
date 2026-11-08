import { serve } from "@hono/node-server";
import { initDB, closeDB } from "../db/connection.js";
import { DatabaseInstance } from "../db/types.js";
import { posterTemplates, platformSettings } from "../db/schema/poster-platform.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../poster-engine/templates-seed.js";
import { WebApiConfig } from "../configs/web-api.js";
import { createWebApiServer } from "./server.js";
import logger from "../utils/logger.js";
import { count } from "drizzle-orm";

async function seedDefaultsIfNeeded(dbInstance: DatabaseInstance) {
  try {
    const [templatesCount] = await dbInstance
      .select({ count: count() })
      .from(posterTemplates);

    if (Number(templatesCount?.count ?? 0) === 0) {
      logger.info("Seeding predefined poster templates...");
      for (const tpl of PREDEFINED_POSTER_TEMPLATES) {
        await dbInstance
          .insert(posterTemplates)
          .values({
            id: tpl.id,
            name: tpl.name,
            styleKey: tpl.styleKey,
            description: tpl.description,
            defaultCategories: tpl.defaultCategories,
            designTokens: tpl.designTokens,
            isActive: true,
          })
          .onConflictDoNothing();
      }
    }

    const [settingsCount] = await dbInstance
      .select({ count: count() })
      .from(platformSettings);

    if (Number(settingsCount?.count ?? 0) === 0) {
      logger.info("Seeding default platform settings...");
      await dbInstance
        .insert(platformSettings)
        .values({
          id: 1,
          fetchIntervalMinutes: 15,
          posterGenerationMode: "manual_approval",
          defaultExportFormat: "instagram_portrait",
          btechOnlyFilter: true,
          officialKtuSources: [
            {
              id: "ktu-anon-announcements",
              name: "KTU Official Portal (/anon/announcemnts)",
              endpoint: "https://api.ktu.edu.in/ktu-web-portal-api/anon/announcemnts",
              enabled: true,
            },
          ],
        })
        .onConflictDoNothing();
    }
  } catch (err) {
    logger.warn({ err }, "Notice: could not seed default templates/settings during startup");
  }
}

async function start() {
  try {
    const dbInstance = await initDB({ max: 5, applicationName: "ktu-web-api" });
    await seedDefaultsIfNeeded(dbInstance);

    const app = createWebApiServer(dbInstance);

    const server = serve(
      {
        fetch: app.fetch,
        port: WebApiConfig.PORT,
        hostname: WebApiConfig.HOST,
      },
      info => {
        logger.info(
          { port: info.port, host: WebApiConfig.HOST },
          "🚀 KTU B.Tech Web Platform API server listening"
        );
      }
    );

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down Web API server...");
      server.close();
      await closeDB();
      process.exit(0);
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (err) {
    logger.error({ err }, "Failed to start Web API server");
    process.exit(1);
  }
}

void start();
