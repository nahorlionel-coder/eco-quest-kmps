// Mock data for the application
export interface User {
  id: string;
  name: string;
  avatar: string;
  department: string;
  points: number;
  level: number;
  streak: number;
  rank: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'energy' | 'waste' | 'commute' | 'food';
  type: 'photo';
  completed: boolean;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: 'daily' | 'weekly';
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image: string;
  category: string;
  available: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  department: string;
  points: number;
  rank: number;
  change: 'up' | 'down' | 'same';
}

export interface DepartmentRank {
  id: string;
  name: string;
  totalPoints: number;
  memberCount: number;
  rank: number;
  avgPoints: number;
}

export const currentUser: User = {
  id: '1',
  name: 'Lionel',
  avatar: '/src/assets/aset-eco.svg',
  department: 'Engineering',
  points: 2450,
  level: 12,
  streak: 7,
  rank: 3,
};

export const weeklySchedule: Record<number, string[]> = {
  1: ['3', '8', '10', '15', '17'],   // Bike to Work, Own Food Container, Meatless, Electricity Patrol, KOGNISI
  2: ['1', '4', '12', '14', '16'],   // Public Transport, Own Tumbler, Gym, 10k Steps, Declutter Inbox
  3: ['2', '9', '11', '13', '15'],   // Carpooling, KG Waste, No Gorengan, Running GBK, Electricity Patrol
  4: ['1', '5', '6', '7', '14'],     // Public Transport, Reusable Bag, Tabung Biru, Donate Utensils, 10k Steps
};

export const dailyMissions: Mission[] = [
  // 🚗 Mobility
  { id: '1', title: 'Use Public Transportation', description: 'Use public transportation for your office commute today', points: 15, category: 'commute', type: 'photo', completed: false, icon: '🚌', difficulty: 'medium', frequency: 'weekly' },
  { id: '2', title: 'Carpooling', description: 'Carpool with colleagues to the office (no online ride-hailing)', points: 25, category: 'commute', type: 'photo', completed: false, icon: '🚗', difficulty: 'medium', frequency: 'weekly' },
  { id: '3', title: 'Bike to Work', description: 'Ride your bike to the office today', points: 40, category: 'commute', type: 'photo', completed: false, icon: '🚴', difficulty: 'hard', frequency: 'weekly' },
  // ♻️ Waste
  { id: '4', title: 'Use Own Tumbler', description: 'Use your own tumbler when buying coffee, tea, or other drinks', points: 5, category: 'waste', type: 'photo', completed: false, icon: '🥤', difficulty: 'easy', frequency: 'weekly' },
  { id: '5', title: 'Use Reusable Bag', description: 'Use a reusable bag when shopping', points: 5, category: 'waste', type: 'photo', completed: false, icon: '🛍️', difficulty: 'easy', frequency: 'weekly' },
  { id: '6', title: 'Tabung Biru', description: 'Drop cigarette butts into the "Tabung Biru" bin', points: 10, category: 'waste', type: 'photo', completed: false, icon: '🚬', difficulty: 'easy', frequency: 'weekly' },
  { id: '7', title: 'Donate Plastic Utensils', description: 'Donate plastic utensils or chopsticks to street vendors', points: 15, category: 'waste', type: 'photo', completed: false, icon: '🥢', difficulty: 'medium', frequency: 'weekly' },
  { id: '8', title: 'Use Own Food Container', description: 'Use your own food container or tupperware when buying food', points: 20, category: 'waste', type: 'photo', completed: false, icon: '🍱', difficulty: 'medium', frequency: 'weekly' },
  { id: '9', title: 'KG Waste Station', description: 'Drop inorganic waste to KG Waste Station', points: 30, category: 'waste', type: 'photo', completed: false, icon: '♻️', difficulty: 'hard', frequency: 'weekly' },
  // 🏃 Health
  { id: '10', title: 'Meatless Consumption', description: 'Choose meatless consumption today, including eggs', points: 10, category: 'food', type: 'photo', completed: false, icon: '🥗', difficulty: 'easy', frequency: 'weekly' },
  { id: '11', title: 'No Gorengan', description: 'Eat healthier foods: NO GORENGAN today', points: 10, category: 'food', type: 'photo', completed: false, icon: '🥦', difficulty: 'easy', frequency: 'weekly' },
  { id: '12', title: 'Workout at Gym', description: 'Work out at the gym today', points: 20, category: 'food', type: 'photo', completed: false, icon: '🏋️', difficulty: 'medium', frequency: 'weekly' },
  { id: '13', title: 'Running at GBK', description: 'Go running at GBK today', points: 25, category: 'food', type: 'photo', completed: false, icon: '🏃', difficulty: 'medium', frequency: 'weekly' },
  { id: '14', title: '10,000 Steps', description: 'Hit 10,000 steps today', points: 30, category: 'food', type: 'photo', completed: false, icon: '👟', difficulty: 'hard', frequency: 'weekly' },
  // ⚡ Energy
  { id: '15', title: 'Electricity Patrol', description: 'Switch off lights in an empty meeting room', points: 5, category: 'energy', type: 'photo', completed: false, icon: '💡', difficulty: 'easy', frequency: 'weekly' },
  { id: '16', title: 'Declutter Inbox', description: 'Clean up and declutter your email inbox today. Take a screenshot as proof.', points: 10, category: 'energy', type: 'photo', completed: false, icon: '📧', difficulty: 'easy', frequency: 'weekly' },
  // 📚 Learning
  { id: '17', title: 'KOGNISI Course', description: 'Complete a sustainability-themed course on KOGNISI', points: 15, category: 'energy', type: 'photo', completed: false, icon: '📚', difficulty: 'medium', frequency: 'weekly' },
];

export const rewards: Reward[] = [
  { id: '1', title: 'Biji Pohon Cabai', description: 'Biji cabai rawit organik siap tanam', pointsCost: 50, image: '🌶️', category: 'Charity', available: true },
  { id: '2', title: 'Donasi Penanaman Pohon', description: '1 pohon ditanam atas nama kamu', pointsCost: 100, image: '🌳', category: 'Charity', available: true },
  { id: '3', title: 'Voucher Kopi Gratis', description: 'Gratis 1 kopi di kantin kantor', pointsCost: 200, image: '☕', category: 'Food & Drink', available: true },
  { id: '4', title: 'Voucher Makan Siang', description: 'Gratis makan siang di kantin', pointsCost: 500, image: '🍱', category: 'Food & Drink', available: true },
  { id: '5', title: 'Merchandise Eco Bag', description: 'Tas belanja ramah lingkungan eksklusif', pointsCost: 300, image: '👜', category: 'Merchandise', available: true },
  { id: '6', title: 'Premium Tumbler', description: 'Tumbler stainless steel premium', pointsCost: 800, image: '🥤', category: 'Merchandise', available: true },
  { id: '7', title: 'Pulang 1 Jam Lebih Awal', description: 'Pulang lebih awal di hari Jumat', pointsCost: 1000, image: '🎉', category: 'Time Off', available: true },
  { id: '8', title: 'Voucher Starbucks 50K', description: 'Voucher digital Starbucks senilai Rp50.000 - sponsored by Starbucks Indonesia', pointsCost: 150, image: '☕', category: 'Food & Drink', available: true, isSponsored: true, sponsorName: 'Starbucks Indonesia' },
  { id: '9', title: 'Botol Minum Aqua Life', description: 'Botol minum daur ulang eksklusif dari Aqua - sponsored by Danone-Aqua', pointsCost: 100, image: '💧', category: 'Merchandise', available: true, isSponsored: true, sponsorName: 'Danone-Aqua' },
  { id: '10', title: 'Diskon 20% Sepatu Adidas', description: 'Voucher diskon 20% untuk koleksi sustainable di Adidas.co.id', pointsCost: 400, image: '👟', category: 'Merchandise', available: true, isSponsored: true, sponsorName: 'Adidas Indonesia' },
  { id: '11', title: 'Donasi Mangrove 5 Pohon', description: 'Tanam 5 pohon mangrove melalui program LindungiHutan - sponsored by Tokopedia', pointsCost: 200, image: '🌊', category: 'Charity', available: true, isSponsored: true, sponsorName: 'Tokopedia' },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Siti Rahayu', avatar: '👩‍💻', department: 'Marketing', points: 3200, rank: 1, change: 'same' },
  { id: '2', name: 'Ahmad Wijaya', avatar: '👨‍💼', department: 'Finance', points: 2890, rank: 2, change: 'up' },
  { id: '3', name: 'Budi Santoso', avatar: '🧑‍💼', department: 'Engineering', points: 2450, rank: 3, change: 'up' },
  { id: '4', name: 'Maya Putri', avatar: '👩‍🔬', department: 'R&D', points: 2340, rank: 4, change: 'down' },
  { id: '5', name: 'Riko Pratama', avatar: '👨‍🎨', department: 'Design', points: 2100, rank: 5, change: 'same' },
  { id: '6', name: 'Dewi Lestari', avatar: '👩‍🏫', department: 'HR', points: 1980, rank: 6, change: 'up' },
  { id: '7', name: 'Andi Saputra', avatar: '👨‍💻', department: 'Engineering', points: 1850, rank: 7, change: 'down' },
  { id: '8', name: 'Lisa Anggraeni', avatar: '👩‍⚕️', department: 'Operations', points: 1720, rank: 8, change: 'same' },
];

export const departmentRanks: DepartmentRank[] = [
  { id: '1', name: 'Engineering', totalPoints: 15400, memberCount: 25, rank: 1, avgPoints: 616 },
  { id: '2', name: 'Marketing', totalPoints: 12800, memberCount: 18, rank: 2, avgPoints: 711 },
  { id: '3', name: 'Kompas TV', totalPoints: 11000, memberCount: 12, rank: 3, avgPoints: 917 },
  { id: '4', name: 'Finance', totalPoints: 9600, memberCount: 15, rank: 4, avgPoints: 640 },
  { id: '5', name: 'Design', totalPoints: 8200, memberCount: 12, rank: 5, avgPoints: 683 },
  { id: '6', name: 'HR', totalPoints: 6400, memberCount: 10, rank: 6, avgPoints: 640 },
];

export const categoryStats = {
  energy: { points: 580, missions: 12 },
  waste: { points: 890, missions: 18 },
  commute: { points: 650, missions: 8 },
  food: { points: 330, missions: 11 },
};
