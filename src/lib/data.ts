import "server-only";
import { prisma } from "@/lib/prisma";

export async function ambilDaftarBatch() {
  return prisma.batchPanen.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function ambilBatch(id: number) {
  return prisma.batchPanen.findUnique({
    where: { id },
    include: {
      qualityChecks: {
        orderBy: { checkedAt: "desc" },
      },
    },
  });
}