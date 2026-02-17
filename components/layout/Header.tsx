"use client";
import { motion } from "framer-motion";
import { Category } from "@/store/useTodoStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  view: "category" | "calendar" | "trash";
  setView: (view: "category" | "calendar" | "trash") => void;
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
    <header className="flex justify-between items-center pt-4 pb-12 border-b border-border w-full gap-4">
      <div className="flex gap-5 sm:gap-6">
        <button
          onClick={() => {
            setView("category");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "category"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          category
          {view === "category" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("calendar");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "calendar"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          calendar
          {view === "calendar" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("trash");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "trash"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          trash
          {view === "trash" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {view === "category" && !activeCategory && (
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setEditingCatId(null);
            }}
            className="text-[13px] font-medium tracking-tight text-muted hover:text-foreground transition-colors lowercase shrink-0 mr-1 px-2 py-1 rounded-md hover:bg-accent"
          >
            {isEditing ? "done" : "edit"}
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
