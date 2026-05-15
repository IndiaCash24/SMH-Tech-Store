import { motion, AnimatePresence } from 'motion/react';
import { Project, Review } from '../types';
import { X, ShoppingCart, Star, Heart, CheckCircle2, Download, ShieldCheck, Mail, Smartphone, Hash, Tag, Flame, Image as ImageIcon, Zap, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ScreenshotGallery from './ScreenshotGallery';
import ReviewsSection from './ReviewsSection';
import CheckoutModal from './CheckoutModal';
import { projectService } from '../lib/projectService';
import { orderService } from '../lib/orderService';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onAddReview: (projectId: string, userName: string, rating: number, comment: string) => void;
}

export default function ProjectModal({ project, onClose, onAddReview }: ProjectModalProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Checkout Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (project) {
      const unsubscribe = projectService.subscribeToReviews(project.id, (fetchedReviews) => {
        setReviews(fetchedReviews);
      });
      
      // Increment views
      projectService.incrementViews(project.id);
      
      return () => unsubscribe();
    }
  }, [project?.id]);

  if (!project) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) return;

    setIsCheckingOut(true);
    try {
      await orderService.createOrder({
        projectId: project.id,
        projectTitle: project.title,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        timestamp: new Date().toISOString(),
        status: 'pending',
        price: project.price
      });
      setIsSuccess(true);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar bg-[#0f111a]">
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-3"
            >
              <CheckCircle2 size={24} />
              Purchase Successful! Check your email.
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="sticky top-0 z-50 bg-[#0f111a]/80 backdrop-blur-md border-b border-border-dark flex items-center justify-between px-4 h-16">
          <button onClick={onClose} className="p-2.5 rounded-xl bg-surface2-dark text-text2-dark hover:text-white transition-all">
            <X size={22} />
          </button>
          <span className="text-[18px] font-black text-[#5b4cf5] tracking-tight">Product Details</span>
          <div className="flex items-center gap-3">
             <button className="p-2.5 rounded-xl bg-surface2-dark text-text2-dark hover:text-white transition-all">
               <Smartphone size={20} />
             </button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
          {/* Main Thumbnail */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-video rounded-3xl overflow-hidden mb-8 border border-border-dark shadow-2xl relative bg-surface2-dark"
          >
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-fill" />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
               <div className="flex items-center gap-2">
                 <Tag size={14} className="text-accent" />
                 <span className="text-xs font-bold text-accent uppercase tracking-widest">{project.category}</span>
               </div>
            </div>
          </motion.div>

          {/* Title & Stats */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black font-title leading-tight mb-4 text-white">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-5 text-text3-dark">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < project.rating ? "text-yellow-500 fill-current" : "text-text3-dark"} />
                ))}
                <span className="text-xs font-bold ml-1">({project.ratingCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    projectService.updateLikes(project.id, 1);
                  }}
                  className="flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-all text-red-500"
                >
                  <Heart size={24} className="fill-current drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-sm font-bold">{project.likes} Likes</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <Eye size={18} className="text-blue-400" />
                <span className="text-sm font-bold text-white">{project.views || 0} views</span>
              </div>
            </div>
          </div>

          <div className="mb-10">
            {/* Screenshots Section moved up here */}
            <ScreenshotGallery screenshots={project.screenshots} />
          </div>

          <div className="space-y-10">
            {/* Description Section */}
            <section>
              <div className="p-1 rounded-full bg-accent/10 border border-accent/20 w-max px-4 mb-4">
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Description</span>
              </div>
              <p className="text-text2-dark leading-relaxed text-[15px] whitespace-pre-wrap">
                {project.description}
              </p>
            </section>

            {/* Core Features Section */}
            <section>
               <h3 className="text-md font-black text-white mb-4">Core Features:</h3>
               <div className="space-y-3">
                 {project.features.map((feature, i) => (
                   <div key={i} className="flex items-start gap-3 text-text2-dark">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                     <span className="text-[14px] leading-snug">{feature}</span>
                   </div>
                 ))}
               </div>
            </section>

            {/* Price section like screenshot */}
            <div className="bg-surface2-dark rounded-[32px] p-8 border border-border-dark">
               <div className="flex items-center gap-2 mb-4">
                 <div className="bg-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                   <Flame size={12} fill="currentColor" />
                   Flash Sale
                 </div>
               </div>
               <div className="flex flex-wrap items-end gap-3 mb-8">
                 {project.originalPrice && (
                    <span className="text-xl font-bold text-text3-dark line-through mb-1">
                      ₹{project.originalPrice.toLocaleString()}
                    </span>
                 )}
                 <span className="text-5xl font-black text-white">
                   ₹{project.price.toLocaleString()}
                 </span>
               </div>

               {/* Secure Checkout Form */}
               <form onSubmit={handleCheckout} className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                     <ShieldCheck size={18} />
                   </div>
                   <h3 className="text-lg font-black text-white">Complete Your Purchase</h3>
                 </div>
 
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-text3-dark uppercase tracking-widest px-1">Full Name</label>
                     <input 
                       required
                       type="text" 
                       value={customerInfo.name}
                       onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                       placeholder="Your name" 
                       className="w-full bg-bg-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text3-dark" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-text3-dark uppercase tracking-widest px-1">Email</label>
                     <input 
                       required
                       type="email" 
                       value={customerInfo.email}
                       onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                       placeholder="you@email.com" 
                       className="w-full bg-bg-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text3-dark" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-text3-dark uppercase tracking-widest px-1">WhatsApp Number</label>
                     <input 
                       required
                       type="text" 
                       value={customerInfo.phone}
                       onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                       placeholder="+91XXXXXXXXXXX" 
                       className="w-full bg-bg-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text3-dark" 
                     />
                   </div>
                 </div>
 
                 <div className="flex flex-col md:flex-row gap-4">
                   <button 
                     type="submit"
                     disabled={isCheckingOut}
                     className="flex-1 bg-surface2-dark border border-border-dark hover:border-accent text-white py-5 rounded-[24px] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isCheckingOut ? (
                       <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         <Zap size={20} fill="currentColor" />
                         Purchase License
                       </>
                     )}
                   </button>
                   
                   <button 
                     type="button"
                     onClick={() => setIsCheckoutModalOpen(true)}
                     className="flex-1 bg-green-600 hover:bg-green-500 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-green-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <ShoppingCart size={20} fill="currentColor" />
                     Order Now
                   </button>
                 </div>
 
                 <div className="flex justify-center gap-6 text-[10px] font-black text-text3-dark uppercase tracking-wider">
                   <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500" /> Secure UPI</span>
                   <span className="flex items-center gap-1.5"><Mail size={12} className="text-purple-500" /> Instant Email</span>
                   <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-yellow-500" /> 100% Original</span>
                 </div>
               </form>
            </div>

            {/* Ratings & Reviews Section */}
            <ReviewsSection 
              projectId={project.id} 
              reviews={reviews} 
              onAddReview={onAddReview} 
            />

            {/* Demo Section */}
            {project.demoUrl && (
              <section className="bg-surface-dark border border-border-dark rounded-[32px] p-6 group">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Interactive Demo</h3>
                    <p className="text-xs text-text3-dark font-bold">Try it before you buy — experience it live.</p>
                  </div>
                </div>
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-green-500 text-green-500 font-black hover:bg-green-500 hover:text-white transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
                >
                  <Download size={20} />
                  Access Demo Experience
                </a>
              </section>
            )}

          </div>

          <div className="mt-12 text-center">
            <button onClick={onClose} className="text-text3-dark font-black text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
               ← Back to results
            </button>
          </div>
        </div>
      </div>
      
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        project={project} 
      />
    </>
  );
}
