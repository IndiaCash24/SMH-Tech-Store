import { motion } from 'motion/react';
import { Home, Info, Headphones, Mail, X, Github, Twitter, MessageCircle, Settings } from 'lucide-react';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { settingsService, SiteConfig } from '../lib/settingsService';
import { useEffect, useState } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}



const SOCIAL_LINKS = [
  { icon: <Github size={20} />, label: 'GitHub' },
  { icon: <Twitter size={20} />, label: 'Twitter' },
  { icon: <MessageCircle size={20} />, label: 'Telegram' },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === 'innocentshayar232@gmail.com' || user?.email === 'codemaxnode02@gmail.com';
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const unsub = settingsService.subscribeToConfig((data) => setConfig(data));
    return () => unsub();
  }, []);

  const MENU_ITEMS = [
    { icon: <Home size={18} />, label: 'Home', active: true, url: '/' },
    { icon: <Info size={18} />, label: 'About', url: config?.aboutLink || '#' },
    { icon: <Headphones size={18} />, label: 'Support', url: config?.supportLink || '#' },
    { icon: <Mail size={18} />, label: 'Contact', url: config?.contactLink || '#' },
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      />
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark z-[110] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <span className="text-2xl font-extrabold brand-gradient tracking-tight">SMH Tech</span>
          <button onClick={onClose} className="text-text3-light dark:text-text3-dark hover:text-accent transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {MENU_ITEMS.map((item, i) => (
              <a 
                key={i}
                href={item.url}
                target={item.url !== '/' && item.url !== '#' ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={item.url === '#' ? (e) => e.preventDefault() : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  item.active 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text2-light dark:text-text2-dark hover:bg-surface2-light dark:hover:bg-surface2-dark hover:text-accent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
            {isAdmin && (
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-admin-panel'));
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-accent bg-accent/10 hover:bg-accent/20 transition-all mt-4 border border-accent/20"
              >
                <Settings size={18} className="animate-spin-slow" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>

          <div className="mt-8">
            <h4 className="px-4 text-[10px] uppercase font-bold tracking-widest text-text3-light dark:text-text3-dark mb-4">Support</h4>
            <div className="space-y-1">
              <a href={config?.communityLink || '#'} target={config?.communityLink ? "_blank" : undefined} rel="noopener noreferrer" onClick={!config?.communityLink ? (e) => e.preventDefault() : undefined} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-text2-light dark:text-text2-dark hover:bg-surface2-light dark:hover:bg-surface2-dark hover:text-accent transition-all">
                <MessageCircle size={18} />
                <span>Join Community</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-surface2-light/50 dark:bg-surface2-dark/50">
          <div className="flex items-center justify-center gap-4">
            {SOCIAL_LINKS.map((link, i) => (
              <a 
                key={i}
                href="#" 
                className="w-10 h-10 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-center text-text2-light dark:text-text2-dark hover:border-accent hover:text-accent hover:bg-surface-light dark:hover:bg-surface-dark transition-all"
                title={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
