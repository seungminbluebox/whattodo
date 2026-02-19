"use client";
import { motion } from "framer-motion";
import { Category } from "@/store/useTodoStore";

interface HeaderProps {
  view: "today" | "category" | "calendar" | "trash";
  setView: (view: "today" | "category" | "calendar" | "trash") => void;
  activeCategory: Category | null;
  setActiveCategory: (cat: Category | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  setEditingCatId: (id: string | null) => void;
}

export default function Header({
  view,
  setView,
  activeCategory,
  setActiveCategory,
  isEditing,
  setIsEditing,
  setEditingCatId,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center py-4 border-b border-border w-full gap-4">
      <div className="flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0 scroll-smooth">
        <button
          onClick={() => {
            setView("today");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 shrink-0 ${
            view === "today"
              ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          today
          {view === "today" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("category");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 shrink-0 ${
            view === "category"
              ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          category
          {view === "category" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("calendar");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 shrink-0 ${
            view === "calendar"
              ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          calendar
          {view === "calendar" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("trash");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 shrink-0 ${
            view === "trash"
              ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          trash
          {view === "trash" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
            />
          )}
        </button>
      </div>
    </header>
  );
}
