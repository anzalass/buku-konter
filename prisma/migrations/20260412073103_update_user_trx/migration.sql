-- AlterTable
ALTER TABLE "JualanHarian" ADD COLUMN     "idUser" TEXT;

-- AlterTable
ALTER TABLE "ServiceHP" ADD COLUMN     "idUser" TEXT;

-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "idUser" TEXT;

-- AlterTable
ALTER TABLE "TransaksiVoucherHarian" ADD COLUMN     "idUser" TEXT;

-- AddForeignKey
ALTER TABLE "TransaksiVoucherHarian" ADD CONSTRAINT "TransaksiVoucherHarian_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JualanHarian" ADD CONSTRAINT "JualanHarian_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceHP" ADD CONSTRAINT "ServiceHP_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
