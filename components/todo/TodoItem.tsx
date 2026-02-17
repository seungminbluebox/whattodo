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
  onEdit?: (id: string, content: string, notes: string) => void;
  isEditing?: boolean;
  editingContent?: string;
  setEditingContent?: (content: string) => void;
  editingNotes?: string;
  setEditingNotes?: (notes: string) => void;
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
  editingNotes,
  setEditingNotes,
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
            {todo.notes && (
              <p className="text-[12px] text-muted-foreground/60 leading-relaxed mt-1 break-words line-clamp-2">
                {todo.notes}
              </p>
            )}
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

  const getDiffDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const diffTime = targetDate.getTime() - todayDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const diffDays = todo.due_date ? getDiffDays(todo.due_date) : 0;

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
            <div className="space-y-2 w-full">
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-[15px] font-medium leading-relaxed text-foreground w-full p-0 focus:ring-0"
                value={editingContent}
                onChange={(e) => setEditingContent?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onUpdateContent?.(todo.id);
                  if (e.key === "Escape") {
                    setEditingId?.(null);
                    setEditingContent?.("");
                    setEditingNotes?.("");
                  }
                }}
              />
              <textarea
                placeholder="Add a memo..."
                className="bg-foreground/5 border-none outline-none text-[13px] font-medium leading-relaxed text-muted-foreground w-full p-3 rounded-xl focus:ring-0 resize-none min-h-[80px]"
                value={editingNotes}
                onChange={(e) => setEditingNotes?.(e.target.value)}
              />
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onUpdateContent?.(todo.id)}
                  className="px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-bold"
                >
                  SAVE
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 group/title">
                <p
                  onClick={() => {
                    if (onEdit) {
                      onEdit(todo.id, todo.content, todo.notes || "");
                    }
                  }}
                  className={`text-[15px] font-semibold leading-snug cursor-text transition-all ${
                    todo.is_completed
                      ? "text-muted/50 line-through decoration-muted/30"
                      : "text-foreground"
                  }`}
                >
                  {todo.content}
                </p>
                {todo.is_recurring && (
                  <Repeat
                    size={12}
                    className={
                      todo.is_completed ? "text-muted/30" : "text-muted/60"
                    }
                    strokeWidth={2.5}
                  />
                )}
              </div>
              {todo.notes && (
                <p
                  onClick={() => {
                    if (onEdit) {
                      onEdit(todo.id, todo.content, todo.notes || "");
                    }
                  }}
                  className={`text-[13px] font-normal leading-relaxed mt-1.5 break-words line-clamp-2 cursor-text transition-colors ${
                    todo.is_completed
                      ? "text-muted/30"
                      : "text-muted-foreground/70"
                  }`}
                >
                  {todo.notes}
                </p>
              )}
            </>
          )}

          {todo.due_date && (
            <div
              className={`flex items-center gap-2 mt-3 transition-opacity ${todo.is_completed ? "opacity-30" : "opacity-100"}`}
            >
              <div className="flex items-center bg-foreground/[0.03] dark:bg-foreground/[0.07] rounded-lg px-2 py-1 gap-2 border border-foreground/[0.03]">
                <span className="text-[10px] text-muted-foreground font-bold tracking-tight">
                  {new Date(todo.due_date).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {!todo.is_completed && (
                  <>
                    <div className="w-[1px] h-2 bg-foreground/10" />
                    <span
                      className={`text-[9px] font-black tracking-wider uppercase ${
                        diffDays <= 3
                          ? "text-red-500"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {diffDays === 0
                        ? "D-Day"
                        : diffDays > 0
                          ? `D-${diffDays}`
                          : `D+${Math.abs(diffDays)}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              if (window.confirm("할 일을 삭제하시겠습니까?")) {
                onDelete?.(todo.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 transition-all ml-4 rounded-full shrink-0"
            title="Delete"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
