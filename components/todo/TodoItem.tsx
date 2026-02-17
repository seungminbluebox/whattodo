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
            <p className="text-[14px] font-normal leading-relaxed text-foreground/50 break-words">
              {todo.content}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <span className="text-[10px] text-foreground/20 uppercase tracking-[0.1em] font-medium">
                  {category.name}
                </span>
              )}
              {todo.due_date && (
                <span className="text-[10px] text-foreground/20 uppercase tracking-[0.1em] font-medium">
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
              className="p-2 text-foreground/40 hover:text-foreground transition-colors"
              title="Restore"
            >
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onPermanentDelete?.(todo.id)}
              className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
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
      className="flex items-start group"
    >
      <button
        onClick={() => onToggle?.(todo.id, todo.is_completed)}
        className={`w-4 h-4 rounded-full border border-border mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center hover:border-foreground transition-colors ${todo.is_completed ? "bg-foreground/10" : ""}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all ${todo.is_completed ? "bg-foreground" : "bg-foreground/0 group-hover:bg-foreground/10"}`}
        ></div>
      </button>
      <div className="flex-grow flex items-start justify-between">
        <div className="flex flex-col flex-grow">
          {isEditing ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-[14px] font-normal leading-relaxed text-foreground w-full p-0 focus:ring-0"
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
              className={`text-[14px] font-normal leading-relaxed cursor-text flex items-center gap-2 ${
                todo.is_completed
                  ? "text-foreground/30 line-through decoration-foreground/30"
                  : "text-foreground/90"
              }`}
            >
              {todo.content}
              {todo.is_recurring && (
                <Repeat size={10} className="text-foreground/30" />
              )}
            </p>
          )}
          {todo.due_date && !todo.is_completed && (
            <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
              <span className="text-[10px] text-foreground/30 uppercase tracking-[0.1em] font-medium whitespace-nowrap">
                {new Date(todo.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap ml-3 ${
                  diffDays <= 3
                    ? "text-red-500 bg-red-500/10"
                    : diffDays === 0
                      ? "text-foreground/80 bg-foreground/5"
                      : "text-foreground/20"
                }`}
              >
                {diffDays === 0
                  ? "today"
                  : diffDays > 0
                    ? `d-${diffDays}`
                    : `d+${Math.abs(diffDays)}`}
              </span>
            </div>
          )}
          {todo.due_date && todo.is_completed && (
            <span className="text-[10px] text-foreground/10 uppercase tracking-[0.1em] font-medium mt-1">
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
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-all ml-4"
          title="Delete"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}
