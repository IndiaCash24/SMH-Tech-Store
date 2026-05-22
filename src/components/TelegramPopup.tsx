import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Users, MessagesSquare } from 'lucide-react';
import { settingsService, SiteConfig } from '../lib/settingsService';

export default function TelegramPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const unsub = settingsService.subscribeToConfig((data) => setConfig(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Show popup after 3 seconds on first load
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenTelegramPopup');
      if (!hasSeenPopup) {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenTelegramPopup', 'true');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const telegramLink = config?.telegramLink || "https://t.me/your_telegram_channel";

  return (
    <>
      {/* Floating Telegram Button (Bottom Left) */}
      <motion.a
        href={telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 left-8 w-16 h-16 bg-[#229ED9] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#229ED9]/40 z-50 group"
      >
        <div className="absolute inset-[-4px] bg-[#229ED9]/20 rounded-full animate-ping pointer-events-none" />
        <Send size={28} className="translate-x-[-2px] translate-y-[2px]" fill="currentColor" />
        
        <div className="absolute left-20 bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark px-4 py-2 rounded-2xl text-[11px] font-black text-text-light dark:text-text-dark whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none -translate-x-4 group-hover:translate-x-0 shadow-xl font-title">
          Join Telegram!
        </div>
      </motion.a>

      {/* Professional Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-surface-dark border border-border-dark rounded-[32px] overflow-hidden shadow-2xl shadow-black/50 relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="h-32 bg-gradient-to-br from-[#229ED9]/20 to-[#2AABEE]/5 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="w-16 h-16 bg-[#229ED9] rounded-2xl shadow-lg shadow-[#229ED9]/30 flex items-center justify-center text-white transform -rotate-6">
                  <Send size={32} className="translate-x-[-2px] translate-y-[2px] transform rotate-6" fill="currentColor" />
                </div>
              </div>

              <div className="p-6 pt-8 text-center relative">
                <h3 className="text-2xl font-black text-white mb-2 font-title leading-tight">SMH Tech Software World</h3>
                <p className="text-sm text-text2-dark mb-6 leading-relaxed">
                  Join our official Telegram community for the latest updates, exclusive resources, and premium software discussions.
                </p>

                <div className="flex flex-col gap-3">
                  <a 
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-[#229ED9] hover:bg-[#2AABEE] text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-[#229ED9]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MessagesSquare size={18} fill="currentColor" />
                    Join Channel Now
                  </a>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-xs font-bold text-text3-dark hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Maybe Later
                  </button>
                </div>
                
                <div className="mt-6 flex justify-center items-center gap-6 text-[10px] text-text3-dark font-black tracking-widest uppercase">
                  <span className="flex items-center gap-1"><Users size={12}/> 5k+ Members</span>
                  <span className="flex items-center gap-1"><Send size={12}/> Daily Updates</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
