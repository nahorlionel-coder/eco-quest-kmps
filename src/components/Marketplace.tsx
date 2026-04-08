import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Gift, Coffee, Clock, TreePine, CheckCircle, Star, Sparkles, Crown, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rewards, type Reward } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const categoryIcons: Record<string, typeof Coffee> = {
  'Food & Drink': Coffee,
  'Time Off': Clock,
  'Merchandise': ShoppingBag,
  'Charity': TreePine,
};

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: string) => void;
}

function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.pointsCost;
  const Icon = categoryIcons[reward.category] || Gift;
  const isPremium = reward.pointsCost > 1000;
  const isPopular = reward.pointsCost <= 500;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: canAfford && reward.available ? 1.05 : 1.02,
        y: canAfford && reward.available ? -8 : -2
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full group"
    >
      <Card
        variant={canAfford && reward.available ? 'glow' : 'glass'}
        className={`h-full overflow-hidden relative transition-all duration-500 ${
          !reward.available ? 'opacity-50 grayscale' : ''
        } ${
          canAfford && reward.available ? 'shadow-xl shadow-primary/20 border-primary/30' : ''
        } ${
          isPremium ? 'bg-gradient-to-br from-purple-500/5 to-pink-500/5' : ''
        }`}
      >
        {/* Premium/Popular badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {isPremium && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          )}
          {isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              POPULER
            </Badge>
          )}
          {reward.isSponsored && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              SPONSOR
            </Badge>
          )}
        </div>

        {/* Availability overlay */}
        {!reward.available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
            <div className="text-center">
              <div className="text-4xl mb-2">😔</div>
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Stok Habis
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-0 flex flex-col h-full">
          {/* Image section with gradient background */}
          <div className="relative">
            <div className={`h-32 flex items-center justify-center rounded-t-xl bg-gradient-to-br ${
              isPremium ? 'from-purple-400/20 via-pink-400/20 to-purple-600/20' :
              isPopular ? 'from-orange-400/20 via-red-400/20 to-orange-600/20' :
              'from-primary/10 via-secondary/10 to-primary/20'
            } relative overflow-hidden`}>
              {/* Animated background particles */}
              {canAfford && reward.available && (
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/30 rounded-full"
                      style={{
                        left: `${10 + i * 12}%`,
                        top: `${20 + (i % 3) * 25}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </div>
              )}
              
              <motion.div
                className="text-5xl z-10 relative"
                animate={canAfford && reward.available ? { 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {reward.image}
              </motion.div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-bold font-display text-lg leading-tight group-hover:text-primary transition-colors">
                {reward.title}
              </h3>
              <Badge variant="outline" className="shrink-0 text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {reward.category.split(' ')[0]}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {reward.description}
            </p>

            {/* Sponsor info */}
            {reward.isSponsored && (
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Disponsori oleh {reward.sponsorName}
              </div>
            )}

            {/* Price and action section */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className={`font-bold font-display text-xl ${
                    canAfford ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {reward.pointsCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">poin diperlukan</div>
                </div>
                
                {canAfford && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Sisa setelah tukar:</div>
                    <div className="font-semibold text-sm">
                      {(userPoints - reward.pointsCost).toLocaleString()} pts
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                variant={canAfford && reward.available ? 'glow' : 'outline'}
                size="sm"
                disabled={!canAfford || !reward.available}
                onClick={() => onRedeem(reward.id)}
                className={`w-full font-semibold transition-all duration-300 ${
                  canAfford && reward.available ? 'shadow-lg hover:shadow-xl' : ''
                }`}
              >
                {!reward.available ? '😔 Habis' :
                 canAfford ? '🎁 Tukar Sekarang' : 
                 `💰 Butuh ${(reward.pointsCost - userPoints).toLocaleString()} pts lagi`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Marketplace() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<Reward | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      if (data) setUserPoints(data.points);
    };
    fetchPoints();
  }, [user]);

  const handleRedeem = async (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (!reward || userPoints < reward.pointsCost) return;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    // Deduct points in DB
    const { error } = await supabase
      .from('profiles')
      .update({ points: userPoints - reward.pointsCost })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Gagal menukar hadiah');
      return;
    }

    // Record redemption history
    await supabase.from('reward_redemptions').insert({
      user_id: user.id,
      reward_id: reward.id,
      reward_title: reward.title,
      points_spent: reward.pointsCost,
    });

    setUserPoints(prev => prev - reward.pointsCost);
    setRedeemedItems(prev => [...prev, id]);
    setShowSuccess(reward);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const categories = [...new Set(rewards.map(r => r.category))];

  return (
    <div className="space-y-8">
      {/* Header section with enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-bounce">🏦</div>
            <div>
              <h2 className="text-3xl font-bold font-display gradient-text">Toko Hadiah</h2>
              <p className="text-muted-foreground text-sm">Tukarkan poin Anda dengan hadiah menarik</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="points" className="text-xl px-6 py-3 shadow-lg">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💎 {userPoints.toLocaleString()}
                <span className="text-sm opacity-80">pts</span>
              </motion.div>
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Poin tersedia</div>
          </div>
        </div>
        
        {/* Stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/10"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm font-semibold">{rewards.filter(r => userPoints >= r.pointsCost).length}</div>
            <div className="text-xs text-muted-foreground">Bisa Ditukar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-sm font-semibold">{rewards.filter(r => r.isSponsored).length}</div>
            <div className="text-xs text-muted-foreground">Sponsor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-sm font-semibold">{rewards.filter(r => r.available).length}</div>
            <div className="text-xs text-muted-foreground">Tersedia</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <Card variant="glow" className="shadow-2xl shadow-primary/30 border-primary/50">
              <CardContent className="p-6">
                <div className="text-center">
                  <motion.div 
                    className="text-6xl mb-3"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    🎉
                  </motion.div>
                  <div className="font-bold font-display text-xl gradient-text mb-2">
                    Selamat! Hadiah Berhasil Ditukar!
                  </div>
                  <div className="text-lg font-semibold mb-1">{showSuccess.title}</div>
                  <div className="text-sm text-muted-foreground">
                    -{showSuccess.pointsCost.toLocaleString()} poin • Sisa: {userPoints.toLocaleString()} poin
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Tim akan menghubungi Anda segera 📞
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories with enhanced styling */}
      {categories.map((category, catIndex) => {
        const categoryRewards = rewards.filter(r => r.category === category);
        const availableCount = categoryRewards.filter(r => r.available && !redeemedItems.includes(r.id)).length;
        const affordableCount = categoryRewards.filter(r => userPoints >= r.pointsCost && r.available && !redeemedItems.includes(r.id)).length;
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.15 }}
            className="space-y-4"
          >
            {/* Category header with stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  {React.createElement(categoryIcons[category] || Gift, { className: 'w-6 h-6 text-primary' })}
                </div>
                <div>
                  <h3 className="font-bold font-display text-xl">{category}</h3>
                  <div className="text-sm text-muted-foreground">
                    {availableCount} tersedia • {affordableCount} bisa ditukar
                  </div>
                </div>
              </div>
              
              <Badge variant="outline" className="text-sm px-3 py-1">
                {categoryRewards.length} item
              </Badge>
            </div>
            
            {/* Rewards grid with better responsive design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: catIndex * 0.1 + index * 0.08,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <RewardCard
                    reward={{
                      ...reward,
                      available: reward.available && !redeemedItems.includes(reward.id),
                    }}
                    userPoints={userPoints}
                    onRedeem={handleRedeem}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
