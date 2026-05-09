import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Thought, Profile } from '../types';
import { Brain, MessageCircle } from 'lucide-react';

interface NeuralFeedProps {
  refresh: number;
}

export function NeuralFeed({ refresh }: NeuralFeedProps) {
  const [thoughts, setThoughts] = useState<(Thought & { profile: Profile })[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThoughts();

    const channel = supabase
      .channel('thoughts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'thoughts' },
        async (payload) => {
          const thought = payload.new as Thought;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', thought.user_id)
            .single();

          if (profile) {
            setThoughts((prev) => [{ ...thought, profile }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refresh]);

  async function loadThoughts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*, profile:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setThoughts((data || []) as (Thought & { profile: Profile })[]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-32 bg-gray-900/50 rounded-xl border border-cyan-500/10 animate-pulse"
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
      <h2 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
        <Brain className="w-5 h-5 text-cyan-400" />
        Feed Neural
      </h2>

      <AnimatePresence mode="popLayout">
        {thoughts.map((thought, index) => (
          <motion.div
            key={thought.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative bg-gradient-to-br from-gray-950/60 to-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition"
          >
            {/* Glow no hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/10 transition opacity-0 group-hover:opacity-100 pointer-events-none" />

            <div className="relative space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-500/40 border border-cyan-500/50 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {thought.profile?.username || 'Usuário'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(thought.created_at).toLocaleString('pt-BR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Conteúdo */}
              <p className="text-gray-200 text-sm leading-relaxed">
                {thought.content}
              </p>

              {/* Emoção */}
              {thought.emotion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block"
                >
                  <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-xs font-medium">
                    {thought.emotion}
                  </span>
                </motion.div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-4 pt-3 border-t border-cyan-500/10 opacity-60 group-hover:opacity-100 transition">
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Conectar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {thoughts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          <p>Nenhum pensamento ainda. Seja o primeiro!</p>
        </motion.div>
      )}
    </div>
  );
}
