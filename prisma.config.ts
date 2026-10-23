import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // `prisma generate` does not connect to the database. Keeping this optional
  // lets builds generate the client even when the database URL is only
  // available to the runtime environment.
  datasource: databaseUrl ? { url: databaseUrl } : undefined,
});
