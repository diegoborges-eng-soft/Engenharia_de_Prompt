import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ConversationRoom } from '../types';
import { MessageSquare, LogIn } from 'lucide-react';

export function AutomaticRooms() {
  const [rooms, setRooms] = useState<ConversationRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadRooms();

    const channel = supabase
      .channel('rooms_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversation_rooms' },
        () => loadRooms()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);

    if (user?.id) {
      const { data } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      setJoinedRooms(new Set(data?.map((m) => m.room_id) || []));
    }
  }

  async function loadRooms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_rooms')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRooms((data || []) as ConversationRoom[]);
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom(roomId: string) {
    if (!currentUser) return;

    try {
      await supabase.from('room_members').insert({
        room_id: roomId,
        user_id: currentUser,
      });

      setJoinedRooms((prev) => new Set([...prev, roomId]));
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="h-24 bg-gray-900/50 rounded-lg animate-pulse"
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
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        Salas Automáticas
      </h2>

      <AnimatePresence mode="popLayout">
        {rooms.length > 0 ? (
          <div className="grid gap-3">
            {rooms.slice(0, 4).map((room, index) => {
              const isJoined = joinedRooms.has(room.id);

              return (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-gradient-to-br from-gray-950/60 to-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/10 transition opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">
                          {room.topic}
                        </h3>
                        {room.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {room.description}
                          </p>
                        )}
                      </div>
                      <motion.button
                        onClick={() => joinRoom(room.id)}
                        disabled={isJoined}
                        whileHover={{ scale: isJoined ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                          isJoined
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'
                        }`}
                      >
                        <LogIn className="w-3 h-3" />
                        {isJoined ? 'Dentro' : 'Entrar'}
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <MessageSquare className="w-3 h-3" />
                      <span>Sala automática criada</span>
                    </div>
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
            <p>Nenhuma sala disponível agora</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
