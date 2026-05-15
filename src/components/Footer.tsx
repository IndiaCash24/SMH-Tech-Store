import { Github, Twitter, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap gap-12 justify-between mb-12">
          <div className="max-w-xs">
            <span className="text-2xl font-extrabold brand-gradient tracking-tight block mb-4">SaraMash</span>
            <p className="text-sm text-text3-light dark:text-text3-dark leading-relaxed">
              Premium software solutions and professional digital assets. Helping businesses grow through technology since 2024.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="text-[11px] uppercase font-bold text-text3-light dark:text-text3-dark tracking-widest mb-6">Company</h4>
              <nav className="flex flex-col gap-3">
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">About Us</a>
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">Privacy Policy</a>
              </nav>
            </div>
            <div>
              <h4 className="text-[11px] uppercase font-bold text-text3-light dark:text-text3-dark tracking-widest mb-6">Contact</h4>
              <nav className="flex flex-col gap-3">
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">Support Center</a>
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">Email Support</a>
                <a href="#" className="text-sm text-text2-light dark:text-text2-dark hover:text-accent transition-colors">Business Inquiry</a>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-text3-light dark:text-text3-dark flex items-center gap-1">
            © 2026 SaraMash. Built with <Heart size={12} className="text-red-500 fill-current" /> for developers.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="text-text3-light dark:text-text3-dark hover:text-accent transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-text3-light dark:text-text3-dark hover:text-accent transition-colors"><Github size={18} /></a>
            <a href="#" className="text-text3-light dark:text-text3-dark hover:text-accent transition-colors"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
