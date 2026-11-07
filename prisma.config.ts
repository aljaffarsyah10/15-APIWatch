import { defineConfig } from "prisma/config";
import fs from "node:fs";
import path from "node:path";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        const val = trimmed.slice("DATABASE_URL=".length).trim();
        return val.replace(/^["']|["']$/g, "");
      }
    }
  }
  return "postgresql://postgres:postgres@localhost:5432/apiwatch";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});

