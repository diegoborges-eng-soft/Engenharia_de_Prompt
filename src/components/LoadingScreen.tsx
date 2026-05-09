import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Partículas animadas */}
      <div className="fixed inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="flex justify-center"
        >
          <Brain className="w-16 h-16 text-cyan-400" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          MENTE COLETIVA
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-1"
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>

        <p className="text-gray-400">Conectando pensadores...</p>
      </motion.div>
    </div>
  );
}
