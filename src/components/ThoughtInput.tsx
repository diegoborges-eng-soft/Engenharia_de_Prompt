import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeThought, createRoom, findMatches } from '../lib/api';

interface ThoughtInputProps {
  onThoughtSubmitted: () => void;
}

export function ThoughtInput({ onThoughtSubmitted }: ThoughtInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const maxChars = 280;
  const isFull = charCount >= maxChars;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Não autenticado');

      const { data: insertedThought } = await supabase
        .from('thoughts')
        .insert({
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (insertedThought) {
        // Analyze emotion
        try {
          await analyzeThought(insertedThought.id, content.trim());
        } catch (err) {
          console.error('Erro ao analisar emoção:', err);
        }

        // Find matches
        try {
          await findMatches(user.id);
        } catch (err) {
          console.error('Erro ao encontrar matches:', err);
        }

        // Create room if emotion detected
        try {
          await createRoom();
        } catch (err) {
          console.error('Erro ao criar sala:', err);
        }
      }

      setContent('');
      setCharCount(0);
      onThoughtSubmitted();
    } catch (error) {
      console.error('Erro ao salvar pensamento:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setCharCount(text.length);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative"
    >
      <div className="relative bg-gradient-to-b from-gray-950/80 to-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
        {/* Glow animado */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-blue-600/0 pointer-events-none"
          animate={{
            background: content.length > 0 ? [
              'radial-gradient(800px at 0% 0%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)',
              'radial-gradient(800px at 100% 100%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
            ] : 'radial-gradient(800px at 50% 50%, rgba(34, 211, 238, 0) 0%, transparent 50%)',
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Textarea */}
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="O que passou pela sua mente agora?"
          maxLength={maxChars}
          className="relative w-full min-h-24 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none resize-none"
        />

        {/* Footer */}
        <div className="relative flex items-center justify-between mt-4 pt-4 border-t border-cyan-500/10">
          <motion.div
            className="text-sm"
            animate={{ color: isFull ? '#ef4444' : '#6b7280' }}
          >
            {charCount}/{maxChars}
          </motion.div>

          <button
            type="submit"
            disabled={!content.trim() || loading || isFull}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/50"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Send className="w-4 h-4" />
            </motion.div>
            {loading ? 'Enviando...' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
