import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-3xl bg-surface2-light dark:bg-surface2-dark flex items-center justify-center text-text3-light dark:text-text3-dark mb-6"
        >
          <SearchX size={40} />
        </motion.div>
        <h3 className="text-xl font-bold font-title mb-2">No projects found</h3>
        <p className="text-text3-light dark:text-text3-dark max-w-xs mx-auto">
          We couldn't find any projects matching your search or filters. Try adjusting them!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard project={project} onClick={onProjectClick} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
