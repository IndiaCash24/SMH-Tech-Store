import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative hero-gradient pt-16 pb-12 overflow-hidden text-center">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#c4bbff] text-[10px] font-bold uppercase tracking-wider mb-6 backdrop-blur-sm"
        >
          <Sparkles size={14} />
          Premium Digital Solutions
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 font-title"
        >
          Elevate Your Business with <br className="hidden md:block" />
          <span className="brand-gradient drop-shadow-2xl">SaraMash</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          High-quality, production-ready software solutions. Start your next big venture with professional-grade tools.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-12 text-white"
        >
          <div className="text-center group">
            <strong className="block text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform">1.2K+</strong>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Projects</span>
          </div>
          <div className="text-center group">
            <strong className="block text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform">45K+</strong>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Downloads</span>
          </div>
          <div className="text-center group">
            <strong className="block text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform">2.5K+</strong>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Happy Devs</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
