import React, { useState } from 'react';
import { CHAPTER_BLOGS, ChapterBlog } from '../data/chapterBlogs';
import { soundManager } from '../audio/soundManager';
import {
  X,
  BookOpen,
  Scroll,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Sun,
  Flame,
  Swords,
  Feather,
  Clock,
  Compass,
} from 'lucide-react';

interface ChapterChroniclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapterId?: number;
}

export const ChapterChroniclesModal: React.FC<ChapterChroniclesModalProps> = ({
  isOpen,
  onClose,
  initialChapterId = 1,
}) => {
  const [selectedBlogId, setSelectedBlogId] = useState<number>(initialChapterId);

  if (!isOpen) return null;

  const currentBlog: ChapterBlog =
    CHAPTER_BLOGS.find((b) => b.chapterId === selectedBlogId) || CHAPTER_BLOGS[0];

  const handleSelect = (chId: number) => {
    soundManager.play('uiClick');
    setSelectedBlogId(chId);
  };

  return (
    <div
      id="chapter-chronicles-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="relative w-full max-w-5xl h-[90vh] bg-neutral-900 border border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
                Epic Chronicles
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                Chapter Story Blogs & Sacred Lore
              </h2>
            </div>
          </div>

          <button
            id="close-chronicles-modal-btn"
            onClick={() => {
              soundManager.play('uiClick');
              onClose();
            }}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Left Chapter List + Right Blog Article */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Chapter List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/40 overflow-y-auto max-h-48 md:max-h-none p-3 space-y-1.5 shrink-0 custom-scrollbar">
            <div className="text-[10px] font-mono tracking-widest text-neutral-400 px-2 py-1 uppercase">
              10 Sacred Episodes
            </div>
            {CHAPTER_BLOGS.map((blog) => {
              const isSelected = blog.chapterId === selectedBlogId;
              return (
                <button
                  key={blog.id}
                  onClick={() => handleSelect(blog.chapterId)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200'
                      : 'hover:bg-neutral-800/60 border border-transparent text-neutral-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/80">
                      <span>CH {blog.chapterId}</span>
                      <span>•</span>
                      <span className="truncate">{blog.kanda}</span>
                    </div>
                    <div className="text-xs font-semibold truncate text-white">
                      {blog.title}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-0.5' : 'text-neutral-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Blog Reader */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-gradient-to-b from-neutral-900 to-neutral-950 custom-scrollbar">
            {/* Blog Header Banner */}
            <div className="space-y-2 border-b border-neutral-800 pb-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  {currentBlog.kanda}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <Clock className="w-3.5 h-3.5" />
                  {currentBlog.readTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <Compass className="w-3.5 h-3.5" />
                  {currentBlog.location}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {currentBlog.title}
              </h1>
              <div className="text-sm font-serif text-amber-300">
                {currentBlog.hindiTitle}
              </div>

              <p className="text-neutral-300 text-sm italic pt-1 leading-relaxed">
                "{currentBlog.summary}"
              </p>
            </div>

            {/* Sacred Sanskrit Sloka Highlight Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-400 pointer-events-none">
                <Sun className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 uppercase mb-2">
                <Feather className="w-4 h-4" />
                <span>Sacred Valmiki Sloka</span>
              </div>
              <div className="font-serif text-base sm:text-lg text-amber-200 font-semibold leading-relaxed tracking-wide">
                {currentBlog.sacredSloka.sanskrit}
              </div>
              <div className="text-xs text-amber-300/80 font-mono mt-1 italic">
                {currentBlog.sacredSloka.transliteration}
              </div>
              <div className="text-xs sm:text-sm text-neutral-300 mt-2.5 border-t border-amber-500/20 pt-2 leading-relaxed">
                <strong className="text-amber-400">Meaning: </strong>
                {currentBlog.sacredSloka.meaning}
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-4 text-neutral-200 text-sm sm:text-base leading-relaxed font-sans">
              {currentBlog.keyStoryBlog.map((paragraph, idx) => (
                <p key={idx} className="leading-7">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Antagonist Profile & Weapon info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Antagonist */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-red-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Chapter Antagonist</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-mono">
                    {currentBlog.antagonistProfile.threatLevel}
                  </span>
                </div>
                <div className="font-serif font-bold text-white text-base">
                  {currentBlog.antagonistProfile.name}
                </div>
                <div className="text-xs text-neutral-400">
                  {currentBlog.antagonistProfile.title}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {currentBlog.antagonistProfile.description}
                </p>
              </div>

              {/* Dharma Takeaway */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-amber-950/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Dharma Insight & Sacred Weapon</span>
                </div>
                <div className="text-xs text-neutral-300">
                  <strong className="text-amber-300">Divine Weapon: </strong>
                  {currentBlog.sacredWeapon}
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed pt-1 border-t border-neutral-800">
                  <strong className="text-amber-300">Spiritual Lesson: </strong>
                  {currentBlog.dharmaLesson}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
