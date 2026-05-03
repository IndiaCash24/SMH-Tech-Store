import { Category } from '../types';
import { LayoutGrid, Briefcase, MessageSquare, Wrench, Gamepad2, ShieldCheck } from 'lucide-react';

interface FilterBarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  resultsCount: number;
}

const CATEGORIES: { label: Category; icon: any }[] = [
  { label: 'All', icon: <LayoutGrid size={16} /> },
  { label: 'Business', icon: <Briefcase size={16} /> },
  { label: 'Communication', icon: <MessageSquare size={16} /> },
  { label: 'Tools', icon: <Wrench size={16} /> },
  { label: 'Games', icon: <Gamepad2 size={16} /> },
  { label: 'Admin', icon: <ShieldCheck size={16} /> },
];

export default function FilterBar({ 
  activeCategory, 
  setActiveCategory, 
  resultsCount 
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-40 bg-bg-dark pt-4 pb-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[14px] font-bold transition-all border-2 ${
                activeCategory === cat.label 
                  ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30' 
                  : 'bg-surface2-dark border-border-dark text-text2-dark hover:border-accent hover:text-white'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] font-bold text-text3-dark uppercase tracking-widest">
            Showing {resultsCount} Projects
          </span>
        </div>
      </div>
    </div>
  );
}
