import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Zap, TrendingUp } from 'lucide-react';

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
}

export function EmotionalInsights() {
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadEmotions();
    }
  }, [currentUser]);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  }

  async function loadEmotions() {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('emotion')
        .eq('user_id', currentUser)
        .not('emotion', 'is', null);

      if (error) throw error;

      // Count emotions
      const emotionCounts: Record<string, number> = {};
      data?.forEach((thought) => {
        if (thought.emotion) {
          emotionCounts[thought.emotion] =
            (emotionCounts[thought.emotion] || 0) + 1;
        }
      });

      const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);

      const emotionList: EmotionData[] = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({
          emotion,
          count,
          percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      setEmotions(emotionList);
    } finally {
      setLoading(false);
    }
  }

  const emotionEmojis: Record<string, string> = {
    alegria: '😊',
    tristeza: '😢',
    raiva: '😠',
    medo: '😨',
    surpresa: '😲',
    calma: '😌',
    confusão: '😕',
    esperança: '🌟',
    dúvida: '🤔',
    gratidão: '🙏',
    neutra: '😐',
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="h-10 bg-gray-900/50 rounded-lg animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        Insights Emocionais
      </h3>

      {emotions.length > 0 ? (
        <div className="space-y-3">
          {emotions.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.emotion}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {emotionEmojis[item.emotion] || '💭'}
                  </span>
                  <span className="text-gray-300 capitalize">
                    {item.emotion}
                  </span>
                </span>
                <span className="text-cyan-400 font-semibold">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4">
          Compartilhe seus pensamentos para ver insights
        </p>
      )}

      {emotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 pt-2 text-xs text-gray-400 border-t border-cyan-500/10"
        >
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          {emotions.length} emoções detectadas
        </motion.div>
      )}
    </div>
  );
}
