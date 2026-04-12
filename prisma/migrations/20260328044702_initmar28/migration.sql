/*
  Warnings:

  - You are about to drop the column `idDownline` on the `Transaksi` table. All the data in the column will be lost.
  - You are about to drop the `Downline` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `hargaModal` on table `Produk` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hargaEceran` on table `Produk` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Downline" DROP CONSTRAINT "Downline_idToko_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_idDownline_fkey";

-- AlterTable
ALTER TABLE "Produk" ADD COLUMN     "terjual" INTEGER DEFAULT 0,
ALTER COLUMN "stok" SET DEFAULT 999999,
ALTER COLUMN "hargaModal" SET NOT NULL,
ALTER COLUMN "hargaEceran" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaksi" DROP COLUMN "idDownline";

-- DropTable
DROP TABLE "Downline";
