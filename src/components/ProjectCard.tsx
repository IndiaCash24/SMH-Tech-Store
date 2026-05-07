import { Project } from '../types';
import { Star, Heart, Share2, Zap, Flame, Twitter, Facebook, Link as LinkIcon, ShoppingCart } from 'lucide-react';
import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projectService } from '../lib/projectService';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const Tooltip = ({ children, text, position = 'top' }: { children: ReactNode; text: string; position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const [show, setShow] = useState(false);

  const getPosClass = () => {
    switch (position) {
      case 'bottom': return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left': return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default: return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            className={`absolute ${getPosClass()} px-2.5 py-1.5 bg-black/95 text-white text-[10px] font-black rounded-lg whitespace-nowrap z-[100] border border-white/10 pointer-events-none shadow-2xl backdrop-blur-sm`}
          >
            {text}
            <div className={`absolute border-4 border-transparent ${
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-black/95' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-black/95' :
              position === 'right' ? 'right-full top-1/2 -translate-y-1/2 border-r-black/95' :
              'top-full left-1/2 -translate-x-1/2 border-t-black/95'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(-1); // -1 means thumbnail

  const allImages = [project.thumbnail, ...(project.screenshots || [])];
  const currentImage = activeImageIndex === -1 ? project.thumbnail : allImages[activeImageIndex];

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ' + project.title + ' on SMH Tech!')}&url=${encodeURIComponent(window.location.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
  };

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
  };

  const discountPercentage = project.originalPrice 
    ? Math.round(((project.originalPrice - project.price) / project.originalPrice) * 100) 
    : 0;

  return (
    <div 
      onClick={() => onClick(project)}
      className="group bg-surface-dark border border-border-dark rounded-[24px] overflow-hidden transition-all duration-300 hover:border-accent hover:card-hover-shadow flex flex-col h-full relative cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden bg-surface2-dark group/img">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            src={currentImage} 
            alt={project.title}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-105"
          />
        </AnimatePresence>
        
        <div className="absolute top-3 right-3 z-20">
          <Tooltip text="Share Project" position="left">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowShare(!showShare);
              }}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 transition-all hover:bg-accent"
            >
              <Share2 size={16} />
            </button>
          </Tooltip>

          <AnimatePresence>
            {showShare && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-11 right-0 bg-surface-dark border border-border-dark rounded-2xl shadow-2xl p-2 flex flex-col gap-1 min-w-[140px] z-[30]"
              >
                <a 
                  href={shareUrls.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-[11px] font-bold text-white transition-colors"
                >
                  <Twitter size={14} className="text-sky-400" /> Twitter
                </a>
                <a 
                  href={shareUrls.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-[11px] font-bold text-white transition-colors"
                >
                  <Facebook size={14} className="text-blue-500" /> Facebook
                </a>
                <button 
                  onClick={copyLink}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-[11px] font-bold text-white transition-colors text-left"
                >
                  <LinkIcon size={14} className="text-accent" /> Copy Link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {project.isFlashDeal && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <div className="bg-[#f97316] text-white text-[11px] font-black font-title px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/20">
              <Flame size={12} fill="currentColor" />
              Sale
            </div>
            {discountPercentage > 0 && (
              <div className="bg-green-500 text-white text-[10px] font-black font-title px-2 py-0.5 rounded-lg shadow-lg shadow-green-500/20">
                -{discountPercentage}% OFF
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10 shadow-xl">
            {project.category}
          </div>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <h3 className="font-bold text-[13px] md:text-[15px] font-title leading-snug mb-3 line-clamp-2 text-white">
          {project.title}
        </h3>
        
        <div className="flex items-center gap-2 md:gap-4 mt-auto">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                className={i < Math.floor(project.rating) ? "text-yellow-500 fill-current" : "text-text3-dark"} 
              />
            ))}
            <span className="text-[10px] font-bold text-text3-dark ml-1">
              {project.ratingCount} Reviews
            </span>
          </div>
          
          <Tooltip text="Like Project">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(true);
                projectService.updateLikes(project.id, 1);
              }}
              className={`ml-auto flex items-center gap-1 transition-all text-[10px] font-bold ${
                isLiked ? 'text-red-500' : 'text-text3-dark'
              } active:scale-90`}
            >
              <Heart size={14} className={isLiked ? 'fill-current text-red-500' : ''} />
              {project.likes}
            </button>
          </Tooltip>
        </div>

        <div className="mt-3 pt-3 border-t border-border-dark flex items-center justify-between gap-1">
          <div className="flex flex-col">
            {project.originalPrice && (
              <span className="text-[10px] font-bold text-text3-dark line-through leading-none">
                ₹{project.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-[16px] md:text-[18px] font-black text-white font-title leading-tight">
              ₹{project.price.toLocaleString()}
            </span>
          </div>

          <Tooltip text="Quick Checkout" position="left">
            <button 
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black font-title transition-all duration-300 active:scale-95 shadow-lg shadow-green-600/20"
              onClick={(e) => {
                e.stopPropagation();
                onClick(project);
              }}
            >
              <ShoppingCart size={14} fill="currentColor" />
              Buy Now
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
