import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// weeklySchedule dari mockData (id berbasis sortOrder 1-17)
// 1: ['3','8','10','15','17']  → Bike to Work, Own Food Container, Meatless, Electricity Patrol, KOGNISI
// 2: ['1','4','12','14','16']  → Public Transport, Own Tumbler, Gym, 10k Steps, Declutter Inbox
// 3: ['2','9','11','13','15']  → Carpooling, KG Waste, No Gorengan, Running GBK, Electricity Patrol
// 4: ['1','5','6','7','14']    → Public Transport, Reusable Bag, Tabung Biru, Donate Utensils, 10k Steps

// weekSlots per misi (sortOrder = id lama)
const weekSlotsMap: Record<number, number[]> = {
  1:  [2, 4],     // Use Public Transportation
  2:  [3],        // Carpooling
  3:  [1],        // Bike to Work
  4:  [2],        // Use Own Tumbler
  5:  [4],        // Use Reusable Bag
  6:  [4],        // Tabung Biru
  7:  [4],        // Donate Plastic Utensils
  8:  [1],        // Use Own Food Container
  9:  [3],        // KG Waste Station
  10: [1],        // Meatless Consumption
  11: [3],        // No Gorengan
  12: [2],        // Workout at Gym
  13: [3],        // Running at GBK
  14: [2, 4],     // 10,000 Steps
  15: [1, 3],     // Electricity Patrol
  16: [2],        // Declutter Inbox
  17: [1],        // KOGNISI Course
};

async function main() {
  console.log("🌱 Seeding missions & rewards...");

  await prisma.mission.deleteMany();
  await prisma.reward.deleteMany();

  const missions = [
    // 🚗 Mobility
    { sortOrder: 1,  title: "Use Public Transportation",  description: "Use public transportation for your office commute today",                    points: 15, category: "commute", type: "photo", icon: "🚌", difficulty: "medium" },
    { sortOrder: 2,  title: "Carpooling",                 description: "Carpool with colleagues to the office (no online ride-hailing)",             points: 25, category: "commute", type: "photo", icon: "🚗", difficulty: "medium" },
    { sortOrder: 3,  title: "Bike to Work",               description: "Ride your bike to the office today",                                         points: 40, category: "commute", type: "photo", icon: "🚴", difficulty: "hard"   },
    // ♻️ Waste
    { sortOrder: 4,  title: "Use Own Tumbler",            description: "Use your own tumbler when buying coffee, tea, or other drinks",               points: 5,  category: "waste",   type: "photo", icon: "🥤", difficulty: "easy"   },
    { sortOrder: 5,  title: "Use Reusable Bag",           description: "Use a reusable bag when shopping",                                            points: 5,  category: "waste",   type: "photo", icon: "🛍️", difficulty: "easy"   },
    { sortOrder: 6,  title: "Tabung Biru",                description: "Drop cigarette butts into the \"Tabung Biru\" bin",                           points: 10, category: "waste",   type: "photo", icon: "🚬", difficulty: "easy"   },
    { sortOrder: 7,  title: "Donate Plastic Utensils",    description: "Donate plastic utensils or chopsticks to street vendors",                    points: 15, category: "waste",   type: "photo", icon: "🥢", difficulty: "medium" },
    { sortOrder: 8,  title: "Use Own Food Container",     description: "Use your own food container or tupperware when buying food",                  points: 20, category: "waste",   type: "photo", icon: "🍱", difficulty: "medium" },
    { sortOrder: 9,  title: "KG Waste Station",           description: "Drop inorganic waste to KG Waste Station",                                   points: 30, category: "waste",   type: "photo", icon: "♻️", difficulty: "hard"   },
    // 🥗 Food & Health
    { sortOrder: 10, title: "Meatless Consumption",       description: "Choose meatless consumption today, including eggs",                           points: 10, category: "food",    type: "photo", icon: "🥗", difficulty: "easy"   },
    { sortOrder: 11, title: "No Gorengan",                description: "Eat healthier foods: NO GORENGAN today",                                     points: 10, category: "food",    type: "photo", icon: "🥦", difficulty: "easy"   },
    { sortOrder: 12, title: "Workout at Gym",             description: "Work out at the gym today",                                                   points: 20, category: "food",    type: "photo", icon: "🏋️", difficulty: "medium" },
    { sortOrder: 13, title: "Running at GBK",             description: "Go running at GBK today",                                                    points: 25, category: "food",    type: "photo", icon: "🏃", difficulty: "medium" },
    { sortOrder: 14, title: "10,000 Steps",               description: "Hit 10,000 steps today",                                                     points: 30, category: "food",    type: "photo", icon: "👟", difficulty: "hard"   },
    // ⚡ Energy & Learning
    { sortOrder: 15, title: "Electricity Patrol",         description: "Switch off lights in an empty meeting room",                                  points: 5,  category: "energy",  type: "photo", icon: "💡", difficulty: "easy"   },
    { sortOrder: 16, title: "Declutter Inbox",            description: "Clean up and declutter your email inbox today. Take a screenshot as proof.",  points: 10, category: "energy",  type: "photo", icon: "📧", difficulty: "easy"   },
    { sortOrder: 17, title: "KOGNISI Course",             description: "Complete a sustainability-themed course on KOGNISI",                          points: 15, category: "energy",  type: "photo", icon: "📚", difficulty: "medium" },
  ];

  for (const m of missions) {
    await prisma.mission.create({
      data: {
        ...m,
        frequency: "weekly",
        active: true,
        weekSlots: weekSlotsMap[m.sortOrder],
      },
    });
  }

  console.log("✅ 17 misi reguler & 11 rewards berhasil di-seed!");
}

main().finally(() => prisma.$disconnect());
