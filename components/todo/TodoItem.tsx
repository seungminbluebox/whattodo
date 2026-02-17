"use client";
import { motion } from "framer-motion";
import { Trash2, RotateCcw, Repeat } from "lucide-react";
import { Todo, Category } from "@/store/useTodoStore";

interface TodoItemProps {
  todo: Todo;
  categories?: Category[];
  onToggle?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string, content: string) => void;
  onPermanentDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  isEditing?: boolean;
  editingContent?: string;
  setEditingContent?: (content: string) => void;
  onUpdateContent?: (id: string) => void;
  setEditingId?: (id: string | null) => void;
  isTrash?: boolean;
}

export default function TodoItem({
  todo,
  categories,
  onToggle,
  onDelete,
  onRestore,
  onPermanentDelete,
  onEdit,
  isEditing,
  editingContent,
  setEditingContent,
  onUpdateContent,
  setEditingId,
  isTrash,
}: TodoItemProps) {
  if (isTrash) {
    const category = categories?.find((c) => c.id === todo.category_id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex items-start group min-h-[48px]"
      >
        <div className="w-1 h-1 bg-foreground/20 rounded-full mt-[10px] mr-4 flex-shrink-0"></div>
        <div className="flex-grow flex items-start justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <p className="text-[14px] font-medium leading-relaxed text-foreground/80 break-words">
              {todo.content}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <span className="text-[10px] text-muted uppercase tracking-[0.1em] font-bold">
                  {category.name}
                </span>
              )}
              {todo.due_date && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium bg-secondary/30 px-1.5 py-0.5 rounded">
                  {new Date(todo.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRestore?.(todo.id, todo.content)}
              className="p-2 text-muted hover:text-foreground transition-colors bg-accent/50 rounded-full"
              title="Restore"
            >
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onPermanentDelete?.(todo.id)}
              className="p-2 text-red-500/70 hover:text-red-500 transition-colors bg-red-500/5 rounded-full"
              title="Permanently Delete"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const dueDate = todo.due_date ? new Date(todo.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate ? dueDate.getTime() - today.getTime() : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-start group py-3 px-2 rounded-xl hover:bg-accent/30 transition-colors"
    >
      <button
        onClick={() => onToggle?.(todo.id, todo.is_completed)}
        className={`w-5 h-5 rounded-full border-2 border-border mt-[2px] mr-4 flex-shrink-0 flex items-center justify-center transition-all ${
          todo.is_completed
            ? "bg-foreground border-foreground scale-95"
            : "bg-transparent hover:border-foreground/50"
        }`}
      >
        {todo.is_completed && (
          <div className="w-1.5 h-1.5 rounded-full bg-background"></div>
        )}
      </button>
      <div className="flex-grow flex items-start justify-between">
        <div className="flex flex-col flex-grow min-w-0">
          {isEditing ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-[15px] font-medium leading-relaxed text-foreground w-full p-0 focus:ring-0"
              value={editingContent}
              onChange={(e) => setEditingContent?.(e.target.value)}
              onBlur={() => onUpdateContent?.(todo.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onUpdateContent?.(todo.id);
                if (e.key === "Escape") {
                  setEditingId?.(null);
                  setEditingContent?.("");
                }
              }}
            />
          ) : (
            <p
              onClick={() => {
                if (onEdit) {
                  onEdit(todo.id, todo.content);
                }
              }}
              className={`text-[15px] font-medium leading-relaxed cursor-text flex items-center gap-2 transition-all ${
                todo.is_completed
                  ? "text-muted line-through decoration-muted/50"
                  : "text-foreground"
              }`}
            >
              {todo.content}
              {todo.is_recurring && (
                <Repeat size={12} className="text-muted/60" strokeWidth={2} />
              )}
            </p>
          )}
          {todo.due_date && !todo.is_completed && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-bold bg-accent px-1.5 py-0.5 rounded">
                {new Date(todo.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.2em] font-black px-1.5 py-0.5 rounded-sm ml-2 ${
                  diffDays < 0
                    ? "text-red-500 bg-red-500/10"
                    : diffDays === 0
                      ? "text-foreground bg-foreground/5 dark:bg-foreground/10"
                      : "text-muted bg-accent/50"
                }`}
              >
                {diffDays === 0
                  ? "today"
                  : diffDays > 0
                    ? `D-${diffDays}`
                    : `D+${Math.abs(diffDays)}`}
              </span>
            </div>
          )}
          {todo.due_date && todo.is_completed && (
            <span className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.1em] font-medium mt-1">
              {new Date(todo.due_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (window.confirm("Move to trash?")) {
              onDelete?.(todo.id);
            }
          }}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-muted hover:text-red-500 transition-all ml-4 bg-accent/30 rounded-full"
          title="Delete"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}
