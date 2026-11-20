-- CreateEnum
CREATE TYPE "Komoditas" AS ENUM ('Cabai Merah', 'Beras Organik', 'Tomat');

-- CreateEnum
CREATE TYPE "GradeMutu" AS ENUM ('GRADE_A', 'GRADE_B');

-- CreateTable
CREATE TABLE "BatchPanen" (
    "id" SERIAL NOT NULL,
    "farmerName" TEXT NOT NULL,
    "commodityName" "Komoditas" NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "grade" "GradeMutu" NOT NULL,
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchPanen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCheck" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchPanen_farmerName_commodityName_key" ON "BatchPanen"("farmerName", "commodityName");

-- CreateIndex
CREATE UNIQUE INDEX "QualityCheck_batchId_inspectorName_key" ON "QualityCheck"("batchId", "inspectorName");

-- AddForeignKey
ALTER TABLE "QualityCheck" ADD CONSTRAINT "QualityCheck_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchPanen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
