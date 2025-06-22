'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadSectionProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadSection({ onImageSelect, isProcessing }: UploadSectionProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer",
          "hover:border-agnp-electric hover:bg-agnp-blue/5",
          isDragActive && "border-agnp-electric bg-agnp-blue/10",
          isProcessing && "opacity-50 cursor-not-allowed",
          preview ? "border-agnp-electric" : "border-white/20"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!isProcessing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium">Clic para cambiar imagen</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-agnp-blue/10 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <ImageIcon className="w-10 h-10 text-agnp-electric" />
              ) : (
                <Upload className="w-10 h-10 text-agnp-blue" />
              )}
            </div>
            
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Suelta tu foto aquí' : 'Arrastra tu foto aquí'}
              </p>
              <p className="text-sm text-white/60">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-white/40 mt-2">
                JPG, PNG o WebP • Máximo 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}