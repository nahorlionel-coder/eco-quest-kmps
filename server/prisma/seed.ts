import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding sample data...");

  await prisma.mission.createMany({
    data: [
      { title: "Bawa botol minum sendiri", description: "Hindari botol plastik sekali pakai", points: 20, category: "waste", icon: "💧", type: "photo", frequency: "daily", difficulty: "easy" },
      { title: "Matikan AC saat keluar", description: "Hemat energi dengan mematikan AC", points: 15, category: "energy", icon: "❄️", type: "check-in", frequency: "daily", difficulty: "easy" },
      { title: "Lapor sampah anorganik", description: "Pisahkan dan foto sampah anorganik", points: 30, category: "waste", icon: "♻️", type: "photo", frequency: "weekly", difficulty: "medium" },
    ],
    skipDuplicates: true,
  });

  await prisma.reward.createMany({
    data: [
      { title: "Tumbler EcoQuest", description: "Botol minum stainless steel", pointsCost: 500, image: "🥤", category: "Merchandise" },
      { title: "Voucher kantin Rp50.000", description: "Voucher makan siang", pointsCost: 300, image: "🍱", category: "Voucher" },
      { title: "Tanaman hias mini", description: "Sukulen untuk meja kerja", pointsCost: 200, image: "🪴", category: "Merchandise" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Done");
}

main().finally(() => prisma.$disconnect());
