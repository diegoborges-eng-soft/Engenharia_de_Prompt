import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { UserConnection } from '../types';
import { Users, Zap } from 'lucide-react';

export function CognitiveMatching() {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadConnections();

      const channel = supabase
        .channel('connections_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_connections' },
          () => loadConnections()
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [currentUser]);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  }

  async function loadConnections() {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(
          `user_a_id.eq.${currentUser},user_b_id.eq.${currentUser}`
        )
        .order('compatibility_score', { ascending: false });

      if (error) throw error;

      setConnections((data || []) as UserConnection[]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-20 bg-gray-900/50 rounded-lg animate-pulse"
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
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" />
        Compatibilidade Cognitiva
      </h2>

      <AnimatePresence>
        {connections.length > 0 ? (
          <div className="space-y-3">
            {connections.slice(0, 5).map((connection, index) => {
              const otherUserId =
                connection.user_a_id === currentUser
                  ? connection.user_b_id
                  : connection.user_a_id;
              const score = Math.round(connection.compatibility_score * 100);

              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-gradient-to-r from-gray-950/60 to-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition"
                >
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-500/40 border border-cyan-500/50 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm truncate">
                          Usuário #{otherUserId?.slice(0, 8)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {connection.reason || 'Pensamentos similares'}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      className="flex items-center gap-2 flex-shrink-0 ml-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-cyan-400 text-sm">
                        {score}%
                      </span>
                    </motion.div>
                  </div>

                  <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <p>Continue compartilhando seus pensamentos para encontrar conexões</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
