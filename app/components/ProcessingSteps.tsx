'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Trophy } from 'lucide-react';

interface ProcessingStepsProps {
  currentStep: 'analyzing' | 'generating' | 'done';
}

export default function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const steps = [
    {
      id: 'analyzing',
      icon: Brain,
      title: 'Analizando tu foto',
      description: 'Identificando tus características únicas'
    },
    {
      id: 'generating',
      icon: Sparkles,
      title: 'Creando tu versión tenista',
      description: 'Generando imagen profesional con IA'
    },
    {
      id: 'done',
      icon: Trophy,
      title: '¡Listo!',
      description: 'Tu transformación está completa'
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-white/10 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-agnp-electric to-agnp-blue rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = step.id === currentStep;

            return (
              <motion.div
                key={step.id}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-agnp-electric to-agnp-blue'
                      : 'bg-white/10'
                  }`}
                  animate={isCurrent ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isCurrent ? Infinity : 0,
                    repeatType: 'reverse'
                  }}
                >
                  <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-white/40'}`} />
                </motion.div>
                
                <h3 className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-white/40'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {currentStep !== 'done' && (
        <div className="mt-8 text-center">
          <motion.div
            className="inline-flex items-center gap-2 text-agnp-electric"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-agnp-electric rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-agnp-electric rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-agnp-electric rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Procesando</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}