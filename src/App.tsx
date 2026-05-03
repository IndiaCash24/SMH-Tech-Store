/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { Project, Category } from './types';
import Navbar from './components/Navbar';
import Drawer from './components/Drawer';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';
import WhatsAppFab from './components/WhatsAppFab';
import ProjectModal from './components/ProjectModal';
import AdminPanel from './components/AdminPanel';
import { projectService } from './lib/projectService';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [projects, selectedProjectId]);

  useEffect(() => {
    projectService.testConnection();
    
    const unsubscribe = projectService.subscribeToProjects((fetchedProjects) => {
      setProjects(fetchedProjects);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
      const matchesPrice = project.price >= priceRange.min && project.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Most Popular') return b.likes - a.likes;
      return 0; // Default or 'Newest'
    });
  }, [projects, searchQuery, activeCategory, sortBy, priceRange]);

  const handleAddReview = async (projectId: string, userName: string, rating: number, comment: string) => {
    await projectService.addReview(projectId, {
      userName,
      rating,
      comment,
      date: new Date().toLocaleDateString()
    });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  useEffect(() => {
    const handleOpenAdmin = () => setIsAdminPanelOpen(true);
    window.addEventListener('open-admin-panel', handleOpenAdmin);
    return () => window.removeEventListener('open-admin-panel', handleOpenAdmin);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-bg-dark text-text-dark' : 'bg-bg-light text-text-light'}`}>
      <Navbar 
        onMenuClick={toggleDrawer} 
        onAdminClick={() => setIsAdminPanelOpen(true)}
        onThemeToggle={toggleDarkMode} 
        isDarkMode={isDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <AnimatePresence>
        {isDrawerOpen && (
          <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        )}
      </AnimatePresence>

      <main>
        <FilterBar 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          resultsCount={filteredProjects.length}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProjectGrid projects={filteredProjects} onProjectClick={(p) => setSelectedProjectId(p.id)} />
        </div>
      </main>

      <Footer />
      <WhatsAppFab />
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProjectId(null)} 
        onAddReview={handleAddReview}
      />
      <AdminPanel 
        isOpen={isAdminPanelOpen} 
        onClose={() => setIsAdminPanelOpen(false)} 
        projects={projects}
      />
    </div>
  );
}
