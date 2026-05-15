import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, Package, Users, BarChart3, TrendingUp, DollarSign, Trash2, AlertTriangle, Check, Trash, Plus, Image as ImageIcon, ListPlus, Save, ArrowLeft, Settings, ShoppingCart } from 'lucide-react';
import { Project, Category } from '../types';
import React, { useState, useEffect } from 'react';
import { projectService } from '../lib/projectService';
import { settingsService, SiteConfig, NavLink } from '../lib/settingsService';
import { orderService, Order } from '../lib/orderService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

type AdminTab = 'overview' | 'products' | 'users' | 'analytics' | 'add' | 'settings' | 'orders';

export default function AdminPanel({ isOpen, onClose, projects }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = orderService.subscribeToOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
    });
    return () => unsubscribe();
  }, []);

  // Settings State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    chatLink: '',
    navLinks: []
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const unsubscribe = settingsService.subscribeToConfig((config) => {
      if (config) setSiteConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Games' as Category,
    price: '',
    originalPrice: '',
    description: '',
    thumbnail: '',
    features: [''],
    screenshots: [''],
    isFlashDeal: false
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalSales = projects.reduce((acc, p) => acc + (p.price * p.ratingCount * 0.4), 0);
  const totalProjects = projects.length;
  const totalLikes = projects.reduce((acc, p) => acc + p.likes, 0);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNewProjectClick = () => {
    setEditingProjectId(null);
    setFormData({
      title: '',
      category: 'Games',
      price: '',
      originalPrice: '',
      description: '',
      thumbnail: '',
      features: [''],
      screenshots: [''],
      isFlashDeal: false
    });
    setFormError(null);
    setSuccessMessage(null);
    setActiveTab('add');
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setFormData({
      title: project.title,
      category: project.category,
      price: project.price.toString(),
      originalPrice: project.originalPrice.toString(),
      description: project.description,
      thumbnail: project.thumbnail,
      features: project.features?.length ? [...project.features] : [''],
      screenshots: project.screenshots?.length ? [...project.screenshots] : [''],
      isFlashDeal: project.isFlashDeal || false
    });
    setActiveTab('add');
  };

  const handleAddField = (field: 'features' | 'screenshots') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleFieldChange = (field: 'features' | 'screenshots', index: number, value: string) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    const salePrice = Number(formData.price);
    const offerPrice = Number(formData.originalPrice);

    if (isNaN(salePrice) || salePrice < 0) {
      setFormError('Please enter a valid numeric selling price.');
      return;
    }

    if (isNaN(offerPrice) || offerPrice < 0) {
      setFormError('Please enter a valid numeric market price.');
      return;
    }

    if (offerPrice < salePrice && offerPrice !== 0) {
      setFormError('Market price should generally be higher than or equal to selling price.');
    }

    setIsSaving(true);
    setSuccessMessage(null);
    try {
      const projectData = {
        title: formData.title,
        category: formData.category,
        price: salePrice,
        originalPrice: offerPrice,
        description: formData.description,
        thumbnail: formData.thumbnail,
        features: formData.features.filter(f => f.trim()),
        screenshots: formData.screenshots.filter(s => s.trim()),
        isFlashDeal: formData.isFlashDeal
      };

      if (editingProjectId) {
        await projectService.updateProject(editingProjectId, projectData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await projectService.createProject(projectData);
        setSuccessMessage('Product uploaded successfully!');
      }

      setFormData({
        title: '',
        category: 'Games',
        price: '',
        originalPrice: '',
        description: '',
        thumbnail: '',
        features: [''],
        screenshots: [''],
        isFlashDeal: false
      });
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('overview');
        setEditingProjectId(null);
      }, 2000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to save project. Please check if all fields are correct.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#0a0c10] custom-scrollbar">
          <nav className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                {activeTab === 'overview' ? <LayoutDashboard size={22} /> : 
                 activeTab === 'add' ? <Plus size={22} /> :
                 activeTab === 'users' ? <Users size={22} /> :
                 activeTab === 'analytics' ? <BarChart3 size={22} /> :
                 activeTab === 'settings' ? <Settings size={22} /> :
                 activeTab === 'orders' ? <ShoppingCart size={22} /> :
                 <Package size={22} />}
              </div>
              <span className="text-xl font-black text-white">
                {activeTab === 'overview' ? 'Admin Dashboard' : 
                 activeTab === 'add' ? (editingProjectId ? 'Edit Product' : 'Add Product') :
                 activeTab === 'users' ? 'User Management' :
                 activeTab === 'analytics' ? 'Performance Analytics' :
                 activeTab === 'settings' ? 'Site Configuration' :
                 activeTab === 'orders' ? 'Sales Orders' :
                 'Product Inventory'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab !== 'add' && (
                <button 
                  onClick={handleAddNewProjectClick}
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                  <Plus size={16} />
                  New Project
                </button>
              )}
              <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 text-text2-dark hover:text-white transition-all">
                <X size={22} />
              </button>
            </div>
          </nav>

          {/* Sticky Toolbar */}
          <div className="sticky top-16 z-40 bg-[#0a0c10]/60 backdrop-blur-sm border-b border-white/5 px-6">
            <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<LayoutDashboard size={16} />} 
                label="Overview" 
              />
              <TabButton 
                active={activeTab === 'products'} 
                onClick={() => setActiveTab('products')} 
                icon={<Package size={16} />} 
                label="Products" 
              />
              <TabButton 
                active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')} 
                icon={<Users size={16} />} 
                label="Users" 
              />
              <TabButton 
                active={activeTab === 'analytics'} 
                onClick={() => setActiveTab('analytics')} 
                icon={<BarChart3 size={16} />} 
                label="Analytics" 
              />
              <TabButton 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')} 
                icon={<Settings size={16} />} 
                label="Settings" 
              />
              <TabButton 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')} 
                icon={<ShoppingCart size={16} />} 
                label="Orders" 
              />
            </div>
          </div>

          <main className="max-w-7xl mx-auto p-6 md:p-8">
            {activeTab === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard 
                    icon={<DollarSign className="text-green-500" />} 
                    label="Approx. Revenue" 
                    value={`₹${Math.round(totalSales).toLocaleString()}`} 
                    trend="+12%" 
                  />
                  <StatCard 
                    icon={<Package className="text-blue-500" />} 
                    label="Total Projects" 
                    value={totalProjects.toString()} 
                    trend="+2" 
                  />
                  <StatCard 
                    icon={<TrendingUp className="text-red-500" />} 
                    label="Total Engagement" 
                    value={totalLikes.toLocaleString()} 
                    trend="+156" 
                  />
                  <StatCard 
                    icon={<BarChart3 className="text-accent" />} 
                    label="Rating Average" 
                    value="4.8" 
                    trend="+0.2" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Recent Inventory */}
                    <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <TrendingUp size={20} className="text-accent" />
                          Recent Inventory
                        </h3>
                        <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-accent hover:underline">View All</button>
                      </div>
                      <InventoryTable projects={projects.slice(0, 5)} onOpenDelete={setProjectToDelete} onEdit={handleEditProject} />
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-surface-dark border border-white/5 rounded-3xl p-6">
                      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Quick Actions</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={handleAddNewProjectClick} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-white border border-white/5">
                          <Plus size={18} className="text-accent" />
                          Add New Project
                        </button>
                        <button className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-white border border-white/5">
                          <ImageIcon size={18} className="text-blue-500" />
                          Manage Media
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'products' && (
              <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Package size={20} className="text-accent" />
                    All Products
                  </h3>
                </div>
                <InventoryTable projects={projects} onOpenDelete={setProjectToDelete} onEdit={handleEditProject} />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-surface-dark border border-white/5 rounded-3xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-text2-dark">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">User Management</h3>
                <p className="text-text2-dark max-w-md mx-auto mb-8">
                  Security protocols are initializing. Soon you will be able to manage all registered buyers and developers from here.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="px-6 py-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold">
                    {projects.reduce((acc, p) => acc + p.ratingCount, 0)} Total Customers
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-surface-dark border border-white/5 rounded-3xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-text2-dark">
                  <BarChart3 size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Performance Analytics</h3>
                <p className="text-text2-dark max-w-md mx-auto mb-8">
                  Analyzing real-time data sync from Firestore... Revenue tracking, user retention, and conversion metrics will appear here.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-text3-dark mb-1">Click Rate</p>
                      <p className="text-xl font-black text-white">4.2%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-text3-dark mb-1">Conversion</p>
                      <p className="text-xl font-black text-white">1.8%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-text3-dark mb-1">Engagement</p>
                      <p className="text-xl font-black text-white">82%</p>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                      <Settings size={20} className="text-accent" />
                      Floating Chat Button Link
                    </h3>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">WhatsApp / Telegram Link</label>
                       <input 
                         type="url" 
                         value={siteConfig.chatLink}
                         onChange={(e) => setSiteConfig({...siteConfig, chatLink: e.target.value})}
                         placeholder="https://wa.me/911234567890"
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                       />
                       <p className="text-[10px] text-text3-dark pl-1">This link will open when the floating chat icon is clicked on the home page.</p>
                    </div>
                    <div className="space-y-2 mt-4">
                       <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Telegram Popup Link</label>
                       <input 
                         type="url" 
                         value={siteConfig.telegramLink || ''}
                         onChange={(e) => setSiteConfig({...siteConfig, telegramLink: e.target.value})}
                         placeholder="https://t.me/your_channel"
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                       />
                       <p className="text-[10px] text-text3-dark pl-1">This link will be used in the Telegram Popup Window.</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                       <ListPlus size={20} className="text-accent" />
                       Toolbar & App Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">About Link</label>
                         <input 
                           type="url" 
                           value={siteConfig.aboutLink || ''}
                           onChange={(e) => setSiteConfig({...siteConfig, aboutLink: e.target.value})}
                           placeholder="https://.../about"
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Support Link</label>
                         <input 
                           type="url" 
                           value={siteConfig.supportLink || ''}
                           onChange={(e) => setSiteConfig({...siteConfig, supportLink: e.target.value})}
                           placeholder="https://.../support"
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Contact Link</label>
                         <input 
                           type="url" 
                           value={siteConfig.contactLink || ''}
                           onChange={(e) => setSiteConfig({...siteConfig, contactLink: e.target.value})}
                           placeholder="https://.../contact"
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Join Community Link</label>
                         <input 
                           type="url" 
                           value={siteConfig.communityLink || ''}
                           onChange={(e) => setSiteConfig({...siteConfig, communityLink: e.target.value})}
                           placeholder="https://t.me/..."
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                         />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Plus size={20} className="text-accent" />
                        Toolbar Navigation Links
                      </h3>
                      <button 
                        onClick={() => setSiteConfig({
                          ...siteConfig,
                          navLinks: [...siteConfig.navLinks, { label: '', url: '' }]
                        })}
                        className="text-[10px] font-black text-accent flex items-center gap-1 hover:brightness-125"
                      >
                        <Plus size={12} /> Add Link
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {siteConfig.navLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-text3-dark uppercase tracking-widest pl-1">Label</label>
                            <input 
                              type="text" 
                              value={link.label}
                              onChange={(e) => {
                                const newLinks = [...siteConfig.navLinks];
                                newLinks[idx].label = e.target.value;
                                setSiteConfig({...siteConfig, navLinks: newLinks});
                              }}
                              placeholder="Contact Us"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="flex-[2] space-y-2">
                            <label className="text-[9px] font-black text-text3-dark uppercase tracking-widest pl-1">URL</label>
                            <input 
                              type="url" 
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...siteConfig.navLinks];
                                newLinks[idx].url = e.target.value;
                                setSiteConfig({...siteConfig, navLinks: newLinks});
                              }}
                              placeholder="https://t.me/smhtech"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newLinks = siteConfig.navLinks.filter((_, i) => i !== idx);
                              setSiteConfig({...siteConfig, navLinks: newLinks});
                            }}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all mb-0.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      setIsSavingSettings(true);
                      try {
                        await settingsService.updateConfig(siteConfig);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSavingSettings(false);
                      }
                    }}
                    disabled={isSavingSettings}
                    className="w-full bg-accent text-white font-black py-4 rounded-2xl text-md hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSavingSettings ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ShoppingCart size={20} className="text-accent" />
                    Pending & Completed Orders
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text3-dark tracking-widest">
                        <th className="pb-4 px-2">Customer Info</th>
                        <th className="pb-4 px-2">Product</th>
                        <th className="pb-4 px-2 text-center">Amount</th>
                        <th className="pb-4 px-2 text-center">Date</th>
                        <th className="pb-4 px-2 text-center">Status</th>
                        <th className="pb-4 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => (
                        <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{order.customerName}</span>
                              <span className="text-[10px] text-text3-dark">{order.customerEmail}</span>
                              <span className="text-[10px] text-accent tracking-tighter">{order.customerPhone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-xs font-bold text-white/80 line-clamp-1">{order.projectTitle}</span>
                          </td>
                          <td className="py-4 px-2 text-center text-sm font-black text-green-500">₹{order.price.toLocaleString()}</td>
                          <td className="py-4 px-2 text-center text-[10px] text-text3-dark">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <select 
                              value={order.status}
                              onChange={(e) => orderService.updateOrderStatus(order.id, e.target.value as any)}
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded border-none outline-none cursor-pointer ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' : 
                                'bg-yellow-500/20 text-yellow-500'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button 
                              onClick={() => orderService.deleteOrder(order.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-text3-dark">
                        <ShoppingCart size={24} />
                      </div>
                      <p className="text-sm font-bold text-text3-dark">No orders found yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-4xl mx-auto"
              >
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center gap-2 text-text3-dark hover:text-white transition-colors mb-6 text-sm font-bold group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </button>

                <form onSubmit={handleSaveProject} className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                      <LayoutDashboard size={20} className="text-accent" />
                      Essential Project Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Project Title</label>
                        <input 
                          required
                          type="text" 
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="FireClash Pro Gaming Suite"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-text3-dark outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Category</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none"
                        >
                          {['Games', 'Tools', 'Business', 'Admin', 'Education', 'Social', 'Other', 'Communication'].sort().map(cat => (
                            <option key={cat} value={cat} className="bg-bg-dark">{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Selling Price (₹)</label>
                        <input 
                          required
                          type="number" 
                          min="0"
                          step="1"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="1999"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Market Price / Offer (₹)</label>
                        <input 
                          required
                          type="number" 
                          min="0"
                          step="1"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                          placeholder="5999"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Detailed Description</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={5}
                        placeholder="Explain features, technical stack, and what the user gets..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>

                  {/* Assets */}
                  <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                      <ImageIcon size={20} className="text-accent" />
                      Visual Identity & Scrnshots
                    </h3>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Main Thumbnail URL</label>
                      <input 
                        required
                        type="url" 
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-text3-dark uppercase tracking-widest pl-1">Multi-Screenshots</label>
                        <button 
                          type="button"
                          onClick={() => handleAddField('screenshots')}
                          className="text-[10px] font-black text-accent flex items-center gap-1 hover:brightness-125"
                        >
                          <Plus size={12} /> Add More
                        </button>
                      </div>
                      {formData.screenshots.map((s, idx) => (
                        <input 
                          key={idx}
                          type="url" 
                          value={s}
                          onChange={(e) => handleFieldChange('screenshots', idx, e.target.value)}
                          placeholder={`Screenshot ${idx + 1} URL`}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <input 
                        type="checkbox" 
                        id="flashDeal"
                        checked={formData.isFlashDeal}
                        onChange={(e) => setFormData({...formData, isFlashDeal: e.target.checked})}
                        className="w-5 h-5 rounded accent-accent"
                      />
                      <label htmlFor="flashDeal" className="text-sm font-bold text-white selection:bg-transparent cursor-pointer">
                        Mark as Flash Deal (Shows fire animation + Zap icon)
                      </label>
                    </div>

                    <AnimatePresence>
                      {formError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold"
                        >
                          <AlertTriangle size={18} />
                          {formError}
                        </motion.div>
                      )}
                      {successMessage && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-sm font-bold"
                        >
                          <Check size={18} />
                          {successMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-accent text-white font-black py-6 rounded-[28px] text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/25 flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={24} className="group-hover:rotate-12 transition-transform" />
                        {editingProjectId ? 'Update Product Details' : 'Publish Product for Sale'}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </main>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {projectToDelete && (
              <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-surface-dark border border-white/5 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 mb-6 mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white text-center mb-2">Delete Project?</h3>
                  <p className="text-sm text-text2-dark text-center mb-8">
                    Are you sure you want to delete <span className="text-white font-bold">"{projectToDelete.title}"</span>? This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setProjectToDelete(null)}
                      className="flex-1 px-6 py-3 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 px-6 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={18} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-surface-dark border border-white/5 p-6 rounded-3xl group hover:border-accent/30 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:bg-accent/10 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <p className="text-[11px] font-bold text-text3-dark uppercase tracking-wider mb-1">{label}</p>
      <h4 className="text-2xl font-black text-white">{value}</h4>
    </div>
  );
}

function Star({ size, fill, className }: { size: number, fill: string, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function InventoryTable({ projects, onOpenDelete, onEdit }: { projects: Project[], onOpenDelete: (p: Project) => void, onEdit: (p: Project) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text3-dark tracking-widest">
            <th className="pb-4 px-2">Project Name</th>
            <th className="pb-4 px-2 text-center">Category</th>
            <th className="pb-4 px-2 text-center">Price</th>
            <th className="pb-4 px-2 text-center">Likes</th>
            <th className="pb-4 px-2 text-center">Rating</th>
            <th className="pb-4 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projects.map((project) => (
            <tr key={project.id} className="group hover:bg-white/5 transition-colors">
              <td className="py-4 px-2">
                <div className="flex items-center gap-3">
                  <img src={project.thumbnail} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-sm font-bold text-white/90 group-hover:text-accent transition-colors">{project.title}</span>
                </div>
              </td>
              <td className="py-4 px-2 text-center text-[10px] font-black uppercase text-text2-dark">
                {project.category}
              </td>
              <td className="py-4 px-2 text-center text-sm font-bold text-white/80">₹{project.price}</td>
              <td className="py-4 px-2 text-center text-sm text-text2-dark">{project.likes}</td>
              <td className="py-4 px-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center gap-1 text-sm font-bold text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    {project.rating}
                  </div>
                  <span className="text-[9px] text-text3-dark">({project.ratingCount} Rev)</span>
                </div>
              </td>
              <td className="py-4 px-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button 
                    onClick={() => onEdit(project)}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                    title="Edit Project"
                  >
                    <Settings size={16} />
                  </button>
                  <button 
                    onClick={() => onOpenDelete(project)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
        active 
          ? 'bg-accent/10 text-accent border border-accent/20' 
          : 'text-text2-dark hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
