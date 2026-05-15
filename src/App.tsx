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
import TelegramPopup from './components/TelegramPopup';

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
                            (project.features || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
      const matchesPrice = project.price >= priceRange.min && project.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Most Popular') return b.likes - a.likes;
      // Default 'Newest'
      return Number(b.id) - Number(a.id);
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
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state?.type === 'project') {
        setSelectedProjectId(state.id);
        setIsAdminPanelOpen(false);
        setIsDrawerOpen(false);
      } else if (state?.type === 'admin') {
        setIsAdminPanelOpen(true);
        setSelectedProjectId(null);
        setIsDrawerOpen(false);
      } else if (state?.type === 'drawer') {
        setIsDrawerOpen(true);
        setSelectedProjectId(null);
        setIsAdminPanelOpen(false);
      } else {
        setSelectedProjectId(null);
        setIsAdminPanelOpen(false);
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Replace initial state so returning to root works
    if (!window.history.state) {
      window.history.replaceState({ type: 'root' }, '');
    }
    // Handle global event for admin panel opening
    const handleOpenAdmin = () => openAdmin();
    window.addEventListener('open-admin-panel', handleOpenAdmin);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('open-admin-panel', handleOpenAdmin);
    };
  }, []);

  const openProject = (id: string) => {
    window.history.pushState({ type: 'project', id }, '');
    setSelectedProjectId(id);
  };

  const closeProject = () => {
    if (window.history.state?.type === 'project') {
      window.history.back();
    } else {
      setSelectedProjectId(null);
    }
  };

  const openAdmin = () => {
    window.history.pushState({ type: 'admin' }, '');
    setIsAdminPanelOpen(true);
  };

  const closeAdmin = () => {
    if (window.history.state?.type === 'admin') {
      window.history.back();
    } else {
      setIsAdminPanelOpen(false);
    }
  };

  const openDrawer = () => {
    window.history.pushState({ type: 'drawer' }, '');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (window.history.state?.type === 'drawer') {
      window.history.back();
    } else {
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-bg-dark text-text-dark' : 'bg-bg-light text-text-light'}`}>
      <Navbar 
        onMenuClick={openDrawer} 
        onAdminClick={openAdmin}
        onThemeToggle={toggleDarkMode} 
        isDarkMode={isDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <AnimatePresence>
        {isDrawerOpen && (
          <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
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
          <ProjectGrid projects={filteredProjects} onProjectClick={(p) => openProject(p.id)} />
        </div>
      </main>

      <Footer />
      <WhatsAppFab />
      <TelegramPopup />
      <ProjectModal 
        project={selectedProject} 
        onClose={closeProject} 
        onAddReview={handleAddReview}
      />
      <AdminPanel 
        isOpen={isAdminPanelOpen} 
        onClose={closeAdmin} 
        projects={projects}
      />
    </div>
  );
}
