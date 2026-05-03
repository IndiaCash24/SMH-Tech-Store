import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, User, Mail, Phone, ShoppingCart, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Project } from '../types';
import { orderService } from '../lib/orderService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export default function CheckoutModal({ isOpen, onClose, project }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        projectId: project.id,
        projectTitle: project.title,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        timestamp: new Date().toISOString(),
        status: 'pending',
        price: project.price
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '' });
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface-dark border border-white/5 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-12 text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h3 className="text-2xl font-black text-white">Order Placed!</h3>
                <p className="text-text2-dark">
                  Thank you, <span className="text-white font-bold">{formData.name}</span>! Our team will contact you shortly regarding <span className="text-white font-bold">{project.title}</span>.
                </p>
                <p className="text-xs text-text3-dark pt-4 italic">Closing in 3 seconds...</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20 text-accent">
                      <ShoppingCart size={20} />
                    </div>
                    <span className="font-black text-white">Checkout</span>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text3-dark hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="bg-white/5 rounded-2xl p-4 flex gap-4 items-center border border-white/5 mb-2">
                    <img src={project.thumbnail} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{project.title}</h4>
                      <p className="text-lg font-black text-accent">₹{project.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-text3-dark tracking-widest pl-1">Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text3-dark" />
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Your Full Name"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-text3-dark tracking-widest pl-1">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text3-dark" />
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="you@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-text3-dark tracking-widest pl-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text3-dark" />
                        <input 
                          required
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+91 1234567890"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-accent text-white font-black py-5 rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Place Order
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-text3-dark">
                    By clicking Place Order, you agree that our team will contact you to complete the transaction and provide delivery.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
