import { z } from "zod";

const webApiConfigSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("*"),
});

export const WebApiConfig = webApiConfigSchema.parse({
  PORT: process.env.WEB_API_PORT,
  HOST: process.env.WEB_API_HOST,
  CORS_ORIGIN: process.env.WEB_API_CORS_ORIGIN,
});

