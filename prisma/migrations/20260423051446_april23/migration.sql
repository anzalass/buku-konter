/*
  Warnings:

  - You are about to drop the column `status` on the `ServiceHP` table. All the data in the column will be lost.
  - Added the required column `statusServis` to the `ServiceHP` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `ServiceHP` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `ServiceHP` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatusServis" AS ENUM ('Pending', 'Proses', 'Selesai', 'Gagal');

-- CreateEnum
CREATE TYPE "StatusAmbil" AS ENUM ('BelumDiambil', 'SudahDiambil');

-- AlterTable
ALTER TABLE "ServiceHP" DROP COLUMN "status",
ADD COLUMN     "garansiBerakhir" TIMESTAMP(3),
ADD COLUMN     "garansiMulai" TIMESTAMP(3),
ADD COLUMN     "statusAmbil" "StatusAmbil" NOT NULL DEFAULT 'BelumDiambil',
ADD COLUMN     "statusServis" "StatusServis" NOT NULL,
ADD COLUMN     "tanggalAmbil" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
