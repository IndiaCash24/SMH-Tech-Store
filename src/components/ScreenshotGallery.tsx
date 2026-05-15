import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: string[];
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

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
            className="flex-shrink-0 w-48 md:w-64 aspect-[9/16] rounded-2xl overflow-hidden border border-border-dark snap-center cursor-pointer relative group bg-surface2-dark flex items-center justify-center p-2"
          >
            <img src={src} className="w-full h-full object-contain" alt={`Screenshot ${i + 1}`} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
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
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[210] w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 backdrop-blur-md border border-red-400/50"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={28} className="drop-shadow-lg" />
            </motion.button>

            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-8 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-sm"
              >
                <ChevronLeft size={28} className="md:w-8 md:h-8" />
              </button>

              <motion.img
                key={selectedIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    handleNext(e as any);
                  } else if (swipe > swipeConfidenceThreshold) {
                    handlePrev(e as any);
                  }
                }}
                src={screenshots[selectedIndex]}
                className="max-w-full max-h-[75vh] md:max-h-[80vh] mb-24 md:mb-32 object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={handleNext}
                className="absolute right-2 md:right-8 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-sm"
              >
                <ChevronRight size={28} className="md:w-8 md:h-8" />
              </button>
            </div>

            <div className="absolute bottom-4 left-0 right-0 z-10 px-4 pb-4">
              <div className="flex gap-3 overflow-x-auto custom-scrollbar snap-x justify-start max-w-4xl mx-auto pb-2 px-4 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]">
                {screenshots.map((src, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(i);
                    }}
                    className={`flex-shrink-0 w-16 h-24 md:w-20 md:h-28 rounded-lg overflow-hidden border-2 transition-all snap-center ${
                      i === selectedIndex 
                        ? 'border-accent shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-10 relative' 
                        : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    <img src={src} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
