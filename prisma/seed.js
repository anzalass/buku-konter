import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // buat toko dulu
  const toko = await prisma.toko.create({
    data: {
      namaToko: "JAVA CELL",
      alamat: "Indonesia",
      noTelp: "628123456789",
      SubscribeTime: new Date(),
      isActive: true,
    },
  });

  // buat user super admin
  const user = await prisma.user.create({
    data: {
      nama: "Super Admin",
      email: "admin@javacell.com",
      password: passwordHash,
      role: "Super Admin",
      idToko: toko.id,
      isActive: true,
    },
  });

  console.log("Seed berhasil dibuat:");
  console.log({
    toko,
    user,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
