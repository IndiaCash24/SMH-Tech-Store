import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: string[];
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (screenshots.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? screenshots.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === screenshots.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <section className="bg-surface-dark border border-border-dark rounded-[32px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white">Project Gallery</h3>
        <span className="text-[10px] font-bold text-text3-dark uppercase">Click to expand</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
        {screenshots.map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(i)}
            className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] rounded-2xl overflow-hidden border border-border-dark snap-center cursor-pointer relative group"
          >
            <img src={src} className="w-full h-full object-cover" alt={`Screenshot ${i + 1}`} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white" size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} />
            </motion.button>

            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={handlePrev}
                className="absolute left-0 z-10 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/5 hidden md:flex"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.img
                key={selectedIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={screenshots[selectedIndex]}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={handleNext}
                className="absolute right-0 z-10 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/5 hidden md:flex"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === selectedIndex ? 'w-8 bg-accent' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
