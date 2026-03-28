-- CreateTable
CREATE TABLE "Toko" (
    "id" TEXT NOT NULL,
    "namaToko" TEXT NOT NULL,
    "logoToko" TEXT,
    "logoTokoId" TEXT,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "SubscribeTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Toko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keuntungan" (
    "id" TEXT NOT NULL,
    "idToko" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keuntunganTransaksi" BIGINT NOT NULL DEFAULT 0,
    "keuntunganVoucherHarian" BIGINT NOT NULL DEFAULT 0,
    "keuntunganAcc" BIGINT NOT NULL DEFAULT 0,
    "keuntunganSparepart" BIGINT NOT NULL DEFAULT 0,
    "keuntunganService" BIGINT NOT NULL DEFAULT 0,
    "keuntunganGrosirVoucher" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keuntungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "penempatan" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "kodeMember" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataMember" (
    "id" TEXT NOT NULL,
    "idToko" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "idMember" TEXT,

    CONSTRAINT "DataMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Downline" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kodeDownline" TEXT NOT NULL,
    "noHp" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Downline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "sub_kategori" TEXT,
    "brand" TEXT NOT NULL,
    "stok" INTEGER,
    "hargaModal" INTEGER,
    "hargaGrosir" INTEGER,
    "hargaEceran" INTEGER,
    "penempatan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiVoucherHarian" (
    "id" TEXT NOT NULL,
    "idProduk" TEXT NOT NULL,
    "idMember" TEXT,
    "keuntungan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "TransaksiVoucherHarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "namaPembeli" TEXT,
    "idDownline" TEXT,
    "totalHarga" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keuntungan" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idMember" TEXT,
    "idToko" TEXT NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemsTransaksi" (
    "id" TEXT NOT NULL,
    "idTransaksi" TEXT NOT NULL,
    "idProduk" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "ItemsTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UangKeluar" (
    "id" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "UangKeluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceHP" (
    "id" TEXT NOT NULL,
    "brandHP" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "namaPelangan" TEXT,
    "status" TEXT NOT NULL,
    "hargaSparePart" INTEGER,
    "noHP" TEXT NOT NULL,
    "biayaJasa" INTEGER NOT NULL,
    "keuntungan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idMember" TEXT,
    "idToko" TEXT NOT NULL,

    CONSTRAINT "ServiceHP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparepartServiceHP" (
    "id" TEXT NOT NULL,
    "idServiceHP" TEXT NOT NULL,
    "idProduk" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "SparepartServiceHP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nominal" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "idToko" TEXT NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JualanHarian" (
    "id" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "nominal" INTEGER,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "idMember" TEXT,
    "idToko" TEXT NOT NULL,

    CONSTRAINT "JualanHarian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keuntungan_idToko_tanggal_key" ON "Keuntungan"("idToko", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_noTelp_key" ON "Member"("noTelp");

-- CreateIndex
CREATE UNIQUE INDEX "Member_kodeMember_key" ON "Member"("kodeMember");

-- CreateIndex
CREATE UNIQUE INDEX "Downline_kodeDownline_key" ON "Downline"("kodeDownline");

-- AddForeignKey
ALTER TABLE "Keuntungan" ADD CONSTRAINT "Keuntungan_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataMember" ADD CONSTRAINT "DataMember_idMember_fkey" FOREIGN KEY ("idMember") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataMember" ADD CONSTRAINT "DataMember_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Downline" ADD CONSTRAINT "Downline_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiVoucherHarian" ADD CONSTRAINT "TransaksiVoucherHarian_idProduk_fkey" FOREIGN KEY ("idProduk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiVoucherHarian" ADD CONSTRAINT "TransaksiVoucherHarian_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiVoucherHarian" ADD CONSTRAINT "TransaksiVoucherHarian_idMember_fkey" FOREIGN KEY ("idMember") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_idMember_fkey" FOREIGN KEY ("idMember") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_idDownline_fkey" FOREIGN KEY ("idDownline") REFERENCES "Downline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsTransaksi" ADD CONSTRAINT "ItemsTransaksi_idTransaksi_fkey" FOREIGN KEY ("idTransaksi") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsTransaksi" ADD CONSTRAINT "ItemsTransaksi_idProduk_fkey" FOREIGN KEY ("idProduk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsTransaksi" ADD CONSTRAINT "ItemsTransaksi_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UangKeluar" ADD CONSTRAINT "UangKeluar_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceHP" ADD CONSTRAINT "ServiceHP_idMember_fkey" FOREIGN KEY ("idMember") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceHP" ADD CONSTRAINT "ServiceHP_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparepartServiceHP" ADD CONSTRAINT "SparepartServiceHP_idServiceHP_fkey" FOREIGN KEY ("idServiceHP") REFERENCES "ServiceHP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparepartServiceHP" ADD CONSTRAINT "SparepartServiceHP_idProduk_fkey" FOREIGN KEY ("idProduk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparepartServiceHP" ADD CONSTRAINT "SparepartServiceHP_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JualanHarian" ADD CONSTRAINT "JualanHarian_idMember_fkey" FOREIGN KEY ("idMember") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JualanHarian" ADD CONSTRAINT "JualanHarian_idToko_fkey" FOREIGN KEY ("idToko") REFERENCES "Toko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
