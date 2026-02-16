"use client";
import { Trash2, RotateCcw } from "lucide-react";
import { Todo } from "@/store/useTodoStore";

interface TodoItemProps {
  todo: Todo;
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
    return (
      <div className="flex items-start group min-h-[48px]">
        <div className="w-1 h-1 bg-white/20 rounded-full mt-[10px] mr-4 flex-shrink-0"></div>
        <div className="flex-grow flex items-start justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <p className="text-[14px] font-normal leading-relaxed text-white/50 break-words">
              {todo.content}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRestore?.(todo.id, todo.content)}
              className="p-2 text-white/40 hover:text-white transition-colors"
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
      </div>
    );
  }

  const dueDate = todo.due_date ? new Date(todo.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate ? dueDate.getTime() - today.getTime() : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-start group">
      <button
        onClick={() => onToggle?.(todo.id, todo.is_completed)}
        className={`w-4 h-4 rounded-full border border-white/20 mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center hover:border-white transition-colors ${todo.is_completed ? "bg-white/10" : ""}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all ${todo.is_completed ? "bg-white" : "bg-white/0 group-hover:bg-white/10"}`}
        ></div>
      </button>
      <div className="flex-grow flex items-start justify-between">
        <div className="flex flex-col flex-grow">
          {isEditing ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-[14px] font-normal leading-relaxed text-white w-full p-0 focus:ring-0"
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
              className={`text-[14px] font-normal leading-relaxed cursor-text ${
                todo.is_completed
                  ? "text-white/30 line-through decoration-white/30"
                  : "text-white/90"
              }`}
            >
              {todo.content}
            </p>
          )}
          {todo.due_date && !todo.is_completed && (
            <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-medium whitespace-nowrap">
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
                      ? "text-white/80 bg-white/5"
                      : "text-white/20"
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
            <span className="text-[10px] text-white/10 uppercase tracking-[0.1em] font-medium mt-1">
              {new Date(todo.due_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete?.(todo.id)}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-all ml-4"
          title="Delete"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
