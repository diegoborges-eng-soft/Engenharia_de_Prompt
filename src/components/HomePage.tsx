import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ThoughtInput } from './ThoughtInput';
import { NeuralFeed } from './NeuralFeed';
import { CognitiveMatching } from './CognitiveMatching';
import { AutomaticRooms } from './AutomaticRooms';
import { EmotionalInsights } from './EmotionalInsights';
import { LogOut, Menu, X } from 'lucide-react';

export function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Partículas animadas de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-40 border-b border-cyan-500/10 bg-gray-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold">MC</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              MENTE COLETIVA
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-cyan-500/10 px-4 py-4"
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition text-sm w-full"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Feed */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  O que passou pela sua mente agora?
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Compartilhe seus pensamentos, conecte-se com mentes similares
              </p>
            </motion.div>

            {/* Thought Input */}
            <ThoughtInput
              onThoughtSubmitted={() => setRefreshTrigger((t) => t + 1)}
            />

            {/* Neural Feed */}
            <NeuralFeed refresh={refreshTrigger} />
          </motion.div>

          {/* Right Column - Sidebar */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Emotional Insights */}
            <div className="bg-gray-950/50 backdrop-blur-xl border border-cyan-500/10 rounded-xl p-5">
              <EmotionalInsights />
            </div>

            {/* Cognitive Matching */}
            <div className="bg-gray-950/50 backdrop-blur-xl border border-cyan-500/10 rounded-xl p-5">
              <CognitiveMatching />
            </div>

            {/* Automatic Rooms */}
            <div className="bg-gray-950/50 backdrop-blur-xl border border-cyan-500/10 rounded-xl p-5">
              <AutomaticRooms />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/10 bg-gray-950/50 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>MENTE COLETIVA © 2024 - Conectando pensadores</p>
        </div>
      </footer>
    </div>
  );
}
