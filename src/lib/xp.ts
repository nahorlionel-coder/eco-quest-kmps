// XP Progression System
// Formula: xpRequired(level) = 9 + level
// Each level needs more XP than the previous

// Player Titles by level range
export const PLAYER_TITLES = [
  { minLevel: 1,  maxLevel: 10, emoji: '🟢', title: 'Rookie',                    description: "You're just like a newborn baby. You may not know everything but keen to know how sustainability works in this world. Every small action you take counts." },
  { minLevel: 11, maxLevel: 20, emoji: '🌱', title: 'Pathfinder',                description: "You've started exploring sustainable habits. With growing awareness and thoughtful perspective, you begin to see how small decisions can shape a better future." },
  { minLevel: 21, maxLevel: 30, emoji: '🌿', title: 'Green Apprentice',          description: "You're becoming part of the movement and learning how small daily choices create meaningful change. You recognize the importance of balance between people, planet, and progress." },
  { minLevel: 31, maxLevel: 40, emoji: '⚙️', title: 'Impact Builder',            description: "You're actively shaping a better environment and culture where sustainability becomes a shared value. Sustainability is no longer an idea — it's something you build every day." },
  { minLevel: 41, maxLevel: 50, emoji: '🌍', title: 'Earth Keeper',              description: "Your presence reflects a deeper understanding that long-term wellbeing depends on collective stewardship. You embody the responsibility of caring for the world we share." },
  { minLevel: 51, maxLevel: 60, emoji: '🛡️', title: 'Climate Vanguard',          description: "A Vanguard stands at the front of change. Your mindset reflects awareness of the planet's challenges and the importance of guiding others toward a more resilient future." },
  { minLevel: 61, maxLevel: 70, emoji: '🏆', title: 'Sustainability Champion',   description: "Champions are recognized for their commitment and consistency. You represent the spirit of sustainability — someone who inspires progress and reinforces the belief that lasting change is possible." },
  { minLevel: 71, maxLevel: 80, emoji: '🌳', title: 'Eco Architect',             description: "An Eco Architect thinks bigger and understands that sustainability is about systems, not just actions. You're optimizing resources, influencing behavior, and making smarter decisions for long-term impact." },
  { minLevel: 81, maxLevel: 90, emoji: '🌎', title: 'Planet Knight',             description: "You're seen as a protector of the planet's future. A Planet Knight symbolizes wisdom, influence, and dedication to preserving the world for generations to come." },
  { minLevel: 91, maxLevel: 99, emoji: '👑', title: 'Legend of the Living Planet', description: "You've reached Legendary status. Sustainability is part of who you are. Through consistent actions and leadership, you reflect mastery of sustainable thinking and the belief that humanity and nature can thrive together." },
];

export function getPlayerTitle(level: number) {
  return PLAYER_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel) ?? PLAYER_TITLES[0];
}

// Get XP required to complete a specific level
export function xpForLevel(level: number): number {
  return 9 + level;
}

// Get cumulative XP needed to START a level (min XP of that level)
export function xpStartOfLevel(level: number): number {
  if (level <= 1) return 1;
  let total = 1;
  for (let l = 1; l < level; l++) {
    total += xpForLevel(l);
  }
  return total;
}

// Get cumulative XP at END of a level (max XP of that level)
export function xpEndOfLevel(level: number): number {
  return xpStartOfLevel(level) + xpForLevel(level) - 1;
}

// Get level from total XP
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (level < 99 && totalXP > xpEndOfLevel(level)) {
    level++;
  }
  return level;
}

// Get XP progress within current level
export function getXPProgress(totalXP: number): { level: number; current: number; required: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  const start = xpStartOfLevel(level);
  const required = xpForLevel(level);
  const current = totalXP - start + 1;
  const percent = Math.min(100, Math.round((current / required) * 100));
  return { level, current, required, percent };
}

// Bonus missions unlock at these levels
export const BONUS_UNLOCK_LEVELS = [10, 20, 30, 40, 50];

export function getUnlockedBonusCount(level: number): number {
  return BONUS_UNLOCK_LEVELS.filter(l => level >= l).length;
}

// Pre-computed level table for reference (level 1-99)
export const LEVEL_TABLE: { level: number; min: number; max: number; xpRequired: number }[] = [];
for (let l = 1; l <= 99; l++) {
  LEVEL_TABLE.push({
    level: l,
    min: xpStartOfLevel(l),
    max: xpEndOfLevel(l),
    xpRequired: xpForLevel(l),
  });
}
