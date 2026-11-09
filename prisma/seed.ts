import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { dataBatchAwal } from "./data-awal";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const data of dataBatchAwal) {
    const batch = await prisma.batchPanen.upsert({
      where: {
        farmerName_commodityName: {
          farmerName: data.farmerName,
          commodityName: data.commodityName,
        },
      },
      update: {},
      create: data,
    });

    await prisma.qualityCheck.upsert({
      where: {
        batchId_inspectorName: {
          batchId: batch.id,
          inspectorName: "Senn Inspector",
        },
      },
      update: {},
      create: {
        batchId: batch.id,
        inspectorName: "Senn Inspector",
        score: 5,
        notes: "Kualitas produk sangat baik dan sesuai standar.",
      },
    });
  }

  console.log("Seed Modul 6 Berhasil!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());