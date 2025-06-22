'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, RefreshCw, Sparkles } from 'lucide-react';
import { downloadImage } from '@/lib/utils';

interface ResultDisplayProps {
  imageUrl: string;
  action: string;
  onReset: () => void;
}

export default function ResultDisplay({ imageUrl, action, onReset }: ResultDisplayProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleDownload = () => {
    downloadImage(imageUrl, `agnp-tennis-champion-${Date.now()}.jpg`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi transformación en el AGNP Tennis 2025',
          text: '¡Mira mi versión tenista profesional creada con IA! 🎾',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-agnp-electric/20 text-agnp-electric px-4 py-2 rounded-full mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">¡Transformación completa!</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          ¡Eres todo un campeón!
        </h2>
        <p className="text-white/80">
          Te hemos capturado {action}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-8">
        <div className="relative aspect-square w-full max-w-2xl mx-auto overflow-hidden rounded-2xl">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-agnp-blue/20 animate-pulse" />
          )}
          
          <motion.img
            src={imageUrl}
            alt="Tu versión tenista profesional"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, filter: 'blur(20px)' }}
            animate={{ 
              scale: isImageLoaded ? 1 : 1.1, 
              filter: isImageLoaded ? 'blur(0px)' : 'blur(20px)'
            }}
            transition={{ duration: 0.5 }}
            onLoad={() => setIsImageLoaded(true)}
          />

          {/* Watermark */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white text-xs font-medium">AGNP SEGUROS 2025</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-agnp-blue hover:bg-agnp-electric text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-agnp-orange hover:bg-agnp-orange/80 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Compartir
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Otra foto
          </motion.button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-white/60 text-sm">
          Nos vemos del 16 al 23 de agosto 2025 en Monterrey
        </p>
      </div>
    </motion.div>
  );
}