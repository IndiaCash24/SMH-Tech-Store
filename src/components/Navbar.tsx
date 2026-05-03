import { Search, Settings, Menu, X, User } from 'lucide-react';
import { auth, signInWithGoogle } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useState, useEffect } from 'react';
import { settingsService, NavLink } from '../lib/settingsService';

interface NavbarProps {
  onMenuClick: () => void;
  onAdminClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ onMenuClick, onAdminClick, searchQuery, setSearchQuery }: NavbarProps) {
  const [user] = useAuthState(auth);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    const unsubscribe = settingsService.subscribeToConfig((config) => {
      if (config && config.navLinks) {
        setNavLinks(config.navLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark border-b border-border-dark flex items-center gap-3 px-4 h-16 shadow-sm">
      <button 
        onClick={onMenuClick}
        className="p-2.5 rounded-xl bg-surface2-dark text-text2-dark hover:text-white transition-all"
      >
        <Menu size={22} />
      </button>

      <a href="/" className="flex-shrink-0">
        <span className="text-[20px] font-black brand-gradient tracking-tight">SMH Tech</span>
      </a>

      {/* Dynamic Nav Links */}
      <div className="hidden lg:flex items-center gap-6 ml-6">
        {navLinks.map((link, idx) => (
          <a 
            key={idx} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-black text-text2-dark hover:text-accent transition-colors uppercase tracking-widest"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex-1 max-w-2xl relative group ml-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text3-dark group-focus-within:text-accent transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-2.5 rounded-2xl bg-surface2-dark text-text-dark text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text3-dark"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text3-dark hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user?.email === 'innocentshayar232@gmail.com' && (
          <button 
            onClick={() => onAdminClick()} 
            className="p-2.5 rounded-xl bg-surface2-dark text-text2-dark hover:text-white transition-all group relative"
            title="Admin Panel"
          >
            <Settings size={20} className="group-hover:rotate-45 transition-transform" />
          </button>
        )}
        {!user && (
          <button 
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-black transition-all hover:shadow-lg shadow-accent/20"
          >
            <User size={16} />
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
