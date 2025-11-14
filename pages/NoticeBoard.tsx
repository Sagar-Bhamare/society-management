
import React, { useState, useMemo } from 'react';
import { NOTICES } from '../constants';
import type { Notice } from '../types';
import { PlusCircle, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';

const NoticeBoard: React.FC = () => {
  const { user } = useAuth();
  const canAddNotice = user?.role === 'Admin' || user?.role === 'Secretary';

  const [notices, setNotices] = useState<Notice[]>(NOTICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'General' as Notice['category'],
    content: ''
  });

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const categories: Notice['category'][] = ['General', 'Event', 'Maintenance', 'Urgent'];

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      const matchesSearch = 
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || notice.category === selectedCategory;
      
      const matchesDate = 
        !selectedDate || notice.date === selectedDate;
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchQuery, selectedCategory, selectedDate, notices]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDate('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({ ...prev, [name]: value }));
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    const noticeToAdd: Notice = {
      id: `not-${Date.now()}`,
      title: newNotice.title.trim(),
      category: newNotice.category,
      content: newNotice.content.trim(),
      date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      publishedBy: user?.role || 'Admin',
    };

    setNotices([noticeToAdd, ...notices]);
    setIsModalOpen(false);
    setNewNotice({ title: '', category: 'General', content: '' });
    toast.success('Notice posted successfully!');
  };

  const getCategoryColor = (category: Notice['category']) => {
    switch (category) {
      case 'Urgent': return 'border-red-500 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/80';
      case 'Event': return 'border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-500/80';
      case 'Maintenance': return 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/80';
      default: return 'border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Notice Board</h1>
        {canAddNotice && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
                <PlusCircle size={20} />
                Post New Notice
            </button>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
            aria-label="Search notices"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
              aria-label="Filter by date"
            />
        </div>
        {(searchQuery || selectedCategory !== 'All' || selectedDate) && (
          <button onClick={clearFilters} className="flex items-center justify-center gap-2 text-sm text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white transition">
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredNotices.map(notice => (
            <div key={notice.id} className={`p-6 rounded-xl border-l-4 ${getCategoryColor(notice.category).split(' ')[0]} bg-white/80 backdrop-blur-md shadow-sm dark:bg-slate-800/80`}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
                  <h2 className="text-xl font-bold text-text-primary dark:text-slate-200">{notice.title}</h2>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getCategoryColor(notice.category)}`}>{notice.category}</span>
              </div>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
                  Published on {notice.date} by {notice.publishedBy}
              </p>
              <p className="mt-4 text-sm text-text-primary dark:text-slate-300">{notice.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
          <p className="text-text-secondary dark:text-slate-400">No notices found matching your criteria.</p>
        </div>
      )}

      <Modal title="Post New Notice" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handlePostNotice} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={newNotice.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Annual General Meeting"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Category</label>
            <select
              id="category"
              name="category"
              value={newNotice.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Content</label>
            <textarea
              id="content"
              name="content"
              rows={5}
              value={newNotice.content}
              onChange={handleInputChange}
              required
              placeholder="Enter the full details of the notice here..."
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Post Notice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoticeBoard;
