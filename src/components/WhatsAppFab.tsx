import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { settingsService } from '../lib/settingsService';

export default function WhatsAppFab() {
  const [chatLink, setChatLink] = useState('https://wa.me/your-number');

  useEffect(() => {
    const unsubscribe = settingsService.subscribeToConfig((config) => {
      if (config && config.chatLink) {
        setChatLink(config.chatLink);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.a
      href={chatLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 w-16 h-16 bg-[#22c55e] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 z-50 group"
    >
      <div className="absolute inset-[-4px] bg-green-500/20 rounded-full animate-ping pointer-events-none" />
      <MessageCircle size={32} fill="currentColor" />
      
      <div className="absolute right-20 bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark px-4 py-2 rounded-2xl text-[11px] font-black text-text-light dark:text-text-dark whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0 shadow-xl font-title">
        Need Help? Chat now!
      </div>
    </motion.a>
  );
}
