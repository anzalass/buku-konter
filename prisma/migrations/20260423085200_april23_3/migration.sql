/*
  Warnings:

  - You are about to drop the column `statusGaransi` on the `ServiceHP` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceHP" DROP COLUMN "statusGaransi";

-- CreateTable
CREATE TABLE "KlaimGaransi" (
    "id" TEXT NOT NULL,
    "idToko" TEXT NOT NULL,
    "idService" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KlaimGaransi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemKlaimGaransi" (
    "id" TEXT NOT NULL,
    "idToko" TEXT NOT NULL,
    "idService" TEXT NOT NULL,
    "idProduct" TEXT,
    "idKlaimGaransi" TEXT NOT NULL,
    "quantityProduct" INTEGER NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "ItemKlaimGaransi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KejadianTakTerduga" (
    "id" TEXT NOT NULL,
    "idToko" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "KejadianTakTerduga_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KlaimGaransi" ADD CONSTRAINT "KlaimGaransi_idService_fkey" FOREIGN KEY ("idService") REFERENCES "ServiceHP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KlaimGaransi" ADD CONSTRAINT "KlaimGaransi_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemKlaimGaransi" ADD CONSTRAINT "ItemKlaimGaransi_idService_fkey" FOREIGN KEY ("idService") REFERENCES "ServiceHP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemKlaimGaransi" ADD CONSTRAINT "ItemKlaimGaransi_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemKlaimGaransi" ADD CONSTRAINT "ItemKlaimGaransi_idProduct_fkey" FOREIGN KEY ("idProduct") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemKlaimGaransi" ADD CONSTRAINT "ItemKlaimGaransi_idKlaimGaransi_fkey" FOREIGN KEY ("idKlaimGaransi") REFERENCES "KlaimGaransi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KejadianTakTerduga" ADD CONSTRAINT "KejadianTakTerduga_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
