'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ProcessingSteps from './components/ProcessingSteps';
import ResultDisplay from './components/ResultDisplay';
import { fileToBase64 } from '@/lib/utils';

type AppState = 'idle' | 'analyzing' | 'generating' | 'done' | 'error';

interface TransformResult {
  imageUrl: string;
  action: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<TransformResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    try {
      setAppState('analyzing');
      setError(null);

      // Convert file to base64
      const base64Image = await fileToBase64(file);

      // Call API
      const response = await fetch('/api/tennis-transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transform image');
      }

      // Update state to generating while waiting
      setAppState('generating');

      const data = await response.json();

      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response from server');
      }

      setResult({
        imageUrl: data.imageUrl,
        action: data.action,
      });
      setAppState('done');

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Algo salió mal. Por favor intenta de nuevo.');
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-agnp-navy via-agnp-navy to-black">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {(appState === 'idle' || appState === 'error') && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="max-w-3xl mx-auto">
                <motion.h1
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-4xl md:text-6xl font-bold text-white mb-4"
                >
                  ¿Tienes madera de{' '}
                  <span className="gradient-text">campeón</span>?
                </motion.h1>
                <motion.p
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-white/80"
                >
                  Descubre tu versión tenista profesional con IA
                </motion.p>
              </div>

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <UploadSection 
                  onImageSelect={handleImageSelect}
                  isProcessing={false}
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-white/60 text-sm max-w-2xl mx-auto"
              >
                <p>
                  Con dedicación y pasión, cualquiera puede ser campeón. 
                  Sube tu foto y descubre cómo te verías en las canchas del Abierto GNP Seguros.
                </p>
              </motion.div>
            </motion.div>
          )}

          {(appState === 'analyzing' || appState === 'generating') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingSteps 
                currentStep={appState === 'analyzing' ? 'analyzing' : 'generating'}
              />
            </motion.div>
          )}

          {appState === 'done' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultDisplay
                imageUrl={result.imageUrl}
                action={result.action}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-white/40 text-sm">
        <p>© 2025 Abierto GNP Seguros. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}