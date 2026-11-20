import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalUntukPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function buatClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    // Modul 7: tampilkan setiap query SQL di terminal untuk penelusuran galat
    log: ["query", "warn", "error"],
  });
}

export const prisma = globalUntukPrisma.prisma ?? buatClient();

if (process.env.NODE_ENV !== "production") {
  globalUntukPrisma.prisma = prisma;
}
