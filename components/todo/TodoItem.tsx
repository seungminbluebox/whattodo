"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, Repeat } from "lucide-react";
import { Todo, Category } from "@/store/useTodoStore";

interface TodoItemProps {
  todo: Todo;
  categories?: Category[];
  onToggle?: (id: string, completed: boolean) => void;
  onSetPlannedDate?: (id: string, date: string | null) => void;
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
  onSetPlannedDate,
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
        onClick={() => {
          if (!todo.is_completed) {
            const audio = new Audio(
              "https://joshwcomeau.com/sounds/pop-down.mp3",
            );
            audio.volume = 1.0;
            audio.play().catch(() => {});
          }
          onToggle?.(todo.id, todo.is_completed);
        }}
        className="relative w-5 h-5 mt-[2px] mr-4 flex-shrink-0 group/check"
      >
        <motion.div
          initial={false}
          animate={{
            scale: todo.is_completed ? [1, 1.25, 1] : 1,
            backgroundColor: todo.is_completed
              ? "rgb(59, 130, 246)"
              : "transparent",
            borderColor: todo.is_completed
              ? "rgb(59, 130, 246)"
              : "var(--border)",
          }}
          transition={{
            scale: { duration: 0.25, ease: "easeOut" },
            default: { type: "spring", stiffness: 500, damping: 30 },
          }}
          whileTap={{ scale: 0.85 }}
          className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-colors ${
            !todo.is_completed && "group-hover/check:border-blue-500/50"
          }`}
        >
          <AnimatePresence>
            {todo.is_completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 800,
                  damping: 35,
                }}
              >
                <svg
                  viewBox="0 0 12 12"
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2.5 6 5 8.5 9.5 3.5" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 터뜨리는 듯한 효과(Particle) - 완료 시에만 잠깐 반짝임 */}
        {todo.is_completed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full border-2 border-blue-500 pointer-events-none"
          />
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
              <div className="flex flex-col gap-1 min-w-0 mb-0.5">
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

                {/* Category Text - Minimalist Style */}
                {categories && categories.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-[9px] text-foreground/30 font-medium tracking-widest uppercase">
                      {(() => {
                        if (!todo.category_id) return "inbox";
                        const cat = categories.find(
                          (c) => c.id === todo.category_id,
                        );
                        return cat ? cat.name : "inbox";
                      })()}
                    </span>
                  </div>
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
          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-4 shrink-0">
            {/* Planning Group: Today & Tomorrow */}
            <div className="flex items-center rounded-xl p-0.5 border border-foreground/[0.08] bg-foreground/[0.01]">
              <button
                onClick={() => {
                  const todayStr = new Date().toLocaleDateString("sv-SE");
                  onSetPlannedDate?.(
                    todo.id,
                    todo.planned_date === todayStr ? null : todayStr,
                  );
                }}
                className={`px-2 py-1.5 rounded-[9px] transition-all flex items-center justify-center min-w-[28px] ${
                  (() => {
                    const todayStr = new Date().toLocaleDateString("sv-SE");
                    return (
                      todo.planned_date === todayStr ||
                      todo.due_date === todayStr
                    );
                  })()
                    ? "text-blue-500 bg-blue-500/15 shadow-sm font-bold"
                    : "text-blue-500/40 hover:bg-blue-500/10 font-medium"
                }`}
                title="Today"
              >
                <span className="text-[10px] leading-none tracking-tight">
                  D
                </span>
              </button>

              <div className="w-[1px] h-3 bg-foreground/[0.08] mx-0.5" />

              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomStr = tomorrow.toLocaleDateString("sv-SE");
                  onSetPlannedDate?.(
                    todo.id,
                    todo.planned_date === tomStr ? null : tomStr,
                  );
                }}
                className={`px-2 py-1.5 rounded-[9px] transition-all flex items-center justify-center min-w-[36px] ${
                  (() => {
                    const tom = new Date();
                    tom.setDate(tom.getDate() + 1);
                    const tomStr = tom.toLocaleDateString("sv-SE");
                    return (
                      todo.planned_date === tomStr || todo.due_date === tomStr
                    );
                  })()
                    ? "text-purple-500 bg-purple-500/15 shadow-sm font-bold"
                    : "text-purple-500/40 hover:bg-purple-500/10 font-medium"
                }`}
                title="Tomorrow"
              >
                <span className="text-[10px] leading-none tracking-tight">
                  D+1
                </span>
              </button>
            </div>

            {/* Separate Delete Action */}
            <button
              onClick={() => {
                if (window.confirm("할 일을 삭제하시겠습니까?")) {
                  onDelete?.(todo.id);
                }
              }}
              className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl shrink-0"
              title="Delete"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
