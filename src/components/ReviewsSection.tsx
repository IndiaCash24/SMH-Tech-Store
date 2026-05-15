import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, User, Calendar, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';
import { auth, signInWithGoogle } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface ReviewsSectionProps {
  projectId: string;
  reviews: Review[];
  onAddReview: (projectId: string, userName: string, rating: number, comment: string) => void;
}

export default function ReviewsSection({ projectId, reviews, onAddReview }: ReviewsSectionProps) {
  const [user] = useAuthState(auth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (user && user.displayName) {
      setUserName(user.displayName);
    }
  }, [user]);

  const predefinedFeedback = [
    "Highly Recommended!",
    "Great App, very useful.",
    "Very Professional UI.",
    "Excellent Support.",
    "Smooth and fast experience.",
    "Worth the price."
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviews.length >= 20) {
      setIsFormOpen(false);
      return;
    }
    if (userName.trim() && comment.trim()) {
      onAddReview(projectId, userName, rating, comment);
      setComment('');
      setRating(5);
      setIsFormOpen(false);
    }
  };

  return (
    <section className="bg-surface-dark border border-border-dark rounded-[32px] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Ratings & Reviews</h3>
            <p className="text-xs text-text3-dark font-bold">{reviews.length} total reviews</p>
          </div>
        </div>
        {!isFormOpen && reviews.length < 20 && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/5"
          >
            <MessageSquarePlus size={16} />
            Write Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-10 p-6 rounded-3xl bg-surface2-dark border border-border-dark overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[11px] font-black text-text3-dark uppercase tracking-widest">Rate your experience:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={20} 
                        className={star <= rating ? "text-yellow-500 fill-current" : "text-text3-dark"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text3-dark uppercase tracking-widest px-1">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full bg-bg-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text3-dark text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-text3-dark uppercase tracking-widest px-1">Select Feedback</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedFeedback.map((fb, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setComment(fb)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                        comment === fb 
                          ? 'bg-accent/20 border-accent/50 text-white' 
                          : 'bg-white/5 border-white/10 text-text3-dark hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {fb}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  disabled={!comment}
                  className="flex-1 bg-accent text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Submit Review
                </button>
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 rounded-2xl bg-white/5 text-white text-xs font-black hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-10 rounded-3xl border border-dashed border-border-dark">
            <p className="text-sm text-text3-dark font-medium">No reviews yet. Be the first to rate!</p>
          </div>
        ) : (
          reviews.slice().reverse().map((review) => (
            <div key={review.id} className="p-5 rounded-3xl bg-white/2 hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <User size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{review.userName}</h4>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={10} 
                          className={i < review.rating ? "text-yellow-500 fill-current" : "text-text3-dark"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-text3-dark">
                  <Calendar size={12} />
                  {review.date}
                </div>
              </div>
              <p className="text-text2-dark text-[13px] leading-relaxed italic pr-4">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
