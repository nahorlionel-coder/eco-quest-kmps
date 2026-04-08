-- Add difficulty column to missions
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'medium';

-- Seed new missions
INSERT INTO public.missions (title, description, points, category, type, icon, difficulty, active) VALUES
  -- Mobility
  ('Public Transport Commute', 'Use public transportation for your office commute today', 15, 'commute', 'photo', '🚌', 'medium', true),
  ('Carpooling', 'Carpool with colleagues (no online ride-hailing)', 25, 'commute', 'photo', '🚗', 'medium', true),
  ('Bike to Work', 'Ride your bike to the office today', 40, 'commute', 'photo', '🚲', 'hard', true),

  -- Waste
  ('Bring Your Own Tumbler', 'Use your own tumbler when buying coffee, tea, or other drinks', 5, 'waste', 'photo', '🥤', 'easy', true),
  ('Reusable Bag', 'Use a reusable bag when shopping', 5, 'waste', 'photo', '🛍️', 'easy', true),
  ('Tabung Biru', 'Drop cigarette butts into the "Tabung Biru" bin', 10, 'waste', 'photo', '🚬', 'easy', true),
  ('Donate Plastic Utensils', 'Donate plastic utensils or chopsticks to street vendors', 15, 'waste', 'photo', '🥢', 'medium', true),
  ('Own Food Container', 'Use your own food container or tupperware when buying food', 20, 'waste', 'photo', '🍱', 'medium', true),
  ('KG Waste Station', 'Drop inorganic waste to KG Waste Station', 30, 'waste', 'photo', '♻️', 'hard', true),

  -- Health
  ('Meatless Meal', 'Choose meatless consumption today (eggs are okay)', 10, 'food', 'photo', '🥗', 'easy', true),
  ('No Gorengan', 'Eat healthier foods: NO GORENGAN today', 10, 'food', 'photo', '🥦', 'easy', true),
  ('Gym Workout', 'Work out at the gym today', 20, 'food', 'photo', '🏋️', 'medium', true),
  ('Running at GBK', 'Go running at GBK today', 25, 'food', 'photo', '🏃', 'medium', true),
  ('10,000 Steps', 'Hit 10,000 steps today', 30, 'food', 'photo', '👟', 'hard', true),

  -- Energy
  ('Electricity Patrol', 'Switch off lights in an empty meeting room', 5, 'energy', 'photo', '💡', 'easy', true),
  ('Declutter Inbox', 'Clean up and declutter your email inbox today', 10, 'energy', 'check-in', '📧', 'easy', true),

  -- Learning
  ('KOGNISI Course', 'Complete a sustainability-themed course on KOGNISI', 15, 'energy', 'photo', '📚', 'medium', true);
