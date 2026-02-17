"use client";
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
    <header className="flex justify-between items-center pt-4 pb-12 border-b border-border w-full">
      <div className="flex gap-6">
        <button
          onClick={() => {
            setView("category");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "category" ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"}`}
        >
          category
        </button>
        <button
          onClick={() => {
            setView("calendar");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "calendar" ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"}`}
        >
          calendar
        </button>
        <button
          onClick={() => {
            setView("trash");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-medium tracking-tight transition-opacity ${view === "trash" ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"}`}
        >
          trash
        </button>
      </div>

      <div className="flex items-center gap-1">
        {view === "category" && !activeCategory && (
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setEditingCatId(null);
            }}
            className="text-[13px] font-normal tracking-tight text-foreground/20 hover:text-foreground/40 transition-colors lowercase shrink-0 mr-2"
          >
            {isEditing ? "done" : "edit"}
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
