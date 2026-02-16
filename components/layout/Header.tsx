"use client";
import { Category } from "@/store/useTodoStore";

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
    <header className="flex justify-between items-center pt-4 pb-12">
      <div className="flex gap-6">
        <button
          onClick={() => {
            setView("category");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "category" ? "text-white" : "text-white/30 hover:text-white/60"}`}
        >
          category
        </button>
        <button
          onClick={() => {
            setView("calendar");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "calendar" ? "text-white" : "text-white/30 hover:text-white/60"}`}
        >
          calendar
        </button>
        <button
          onClick={() => {
            setView("trash");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "trash" ? "text-white" : "text-white/30 hover:text-white/60"}`}
        >
          trash
        </button>
      </div>

      {view === "category" && !activeCategory && (
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setEditingCatId(null);
          }}
          className="text-[13px] font-normal tracking-tight text-white/20 hover:text-white/40 transition-colors lowercase shrink-0"
        >
          {isEditing ? "done" : "edit"}
        </button>
      )}
    </header>
  );
}
