"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  RotateCcw,
  Repeat,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Todo, Category } from "@/store/useTodoStore";

interface TodoItemProps {
  todo: Todo;
  categories?: Category[];
  onToggle?: (id: string, completed: boolean) => void;
  onSetPlannedDate?: (id: string, date: string | null) => void;
  onSetDueDate?: (id: string, date: string | null) => void;
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

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

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

export default function TodoItem({
  todo,
  categories,
  onToggle,
  onSetPlannedDate,
  onSetDueDate,
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
        className="flex items-start group py-3 px-2 rounded-xl hover:bg-accent/30 transition-colors"
      >
        <div className="w-5 h-5 mt-[2px] mr-4 flex-shrink-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />
        </div>
        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-grow flex flex-col min-w-0">
              <p className="text-[15px] font-semibold leading-snug text-foreground/40 line-through decoration-foreground/20 break-words">
                {todo.content}
              </p>

              {/* Category & Badges Metadata Row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5 opacity-50">
                {category && (
                  <span className="text-[9px] text-foreground/30 font-semibold tracking-widest uppercase">
                    {category.name}
                  </span>
                )}

                {todo.planned_date && (
                  <div
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tighter uppercase",
                      (() => {
                        const diff = getDiffDays(todo.planned_date!);
                        if (diff === 0) return "bg-blue-500/10 text-blue-500";
                        if (diff === 1)
                          return "bg-purple-500/10 text-purple-500";
                        return "bg-foreground/5 text-foreground/40";
                      })(),
                    )}
                  >
                    {(() => {
                      const diff = getDiffDays(todo.planned_date!);
                      if (diff === 0) return "D";
                      if (diff === 1) return "D+1";
                      return diff > 0 ? `D+${diff}` : `D${diff}`;
                    })()}
                  </div>
                )}

                {todo.due_date && (
                  <div
                    className={cn(
                      "px-1.5 py-0.5 rounded-md border text-[9px] font-bold tracking-tight whitespace-nowrap",
                      (() => {
                        const diff = getDiffDays(todo.due_date!);
                        if (diff < 0)
                          return "bg-foreground/[0.03] text-foreground/40 border-foreground/10";
                        if (diff <= 3)
                          return "bg-rose-500/5 text-rose-500 border-rose-500/10";
                        return "bg-amber-500/5 text-amber-500 border-amber-500/10";
                      })(),
                    )}
                  >
                    {new Date(todo.due_date).toLocaleDateString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                    })}
                    <span className="mx-1 opacity-20">|</span>
                    {(() => {
                      const diff = getDiffDays(todo.due_date!);
                      if (diff === 0) return "D-Day";
                      return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-start mt-0.5">
              <button
                onClick={() => onRestore?.(todo.id, todo.content)}
                className="p-2 text-muted/30 hover:text-blue-500 hover:bg-blue-500/10 transition-all rounded-xl"
                title="Restore"
              >
                <RotateCcw size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => onPermanentDelete?.(todo.id)}
                className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
                title="Permanently Delete"
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {todo.notes && (
            <p className="text-[13px] font-normal leading-relaxed mt-1.5 break-words text-muted/30 line-clamp-2">
              {todo.notes}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  const diffDays =
    todo.due_date || todo.planned_date
      ? getDiffDays(todo.due_date || todo.planned_date!)
      : 0;

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
      <div className="flex-grow flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-3">
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
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {/* Planning Group moved inside Edit Mode */}
                    <div className="flex items-center rounded-xl p-0.5 border border-foreground/[0.08] bg-foreground/[0.01]">
                      <button
                        onClick={() => {
                          const todayStr = new Date().toLocaleDateString(
                            "sv-SE",
                          );
                          onSetPlannedDate?.(
                            todo.id,
                            todo.planned_date === todayStr ? null : todayStr,
                          );
                        }}
                        className={`px-2 py-1.5 rounded-[9px] transition-all flex items-center justify-center min-w-[28px] ${
                          (() => {
                            const todayStr = new Date().toLocaleDateString(
                              "sv-SE",
                            );
                            // Only highlight if explicitly planned for today
                            return todo.planned_date === todayStr;
                          })()
                            ? "text-blue-600 bg-blue-500/25 shadow-md font-black scale-105"
                            : "text-blue-500/90 hover:bg-blue-500/10 font-medium"
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
                        className={`px-2 py-1.5 rounded-[9px] transition-all flex items-center justify-center min-w-[32px] ${
                          (() => {
                            const tom = new Date();
                            tom.setDate(tom.getDate() + 1);
                            const tomStr = tom.toLocaleDateString("sv-SE");
                            // Only highlight if explicitly planned for tomorrow
                            return todo.planned_date === tomStr;
                          })()
                            ? "text-purple-600 bg-purple-500/25 shadow-md font-black scale-105"
                            : "text-purple-500/90 hover:bg-purple-500/10 font-medium"
                        }`}
                        title="Tomorrow"
                      >
                        <span className="text-[10px] leading-none tracking-tight">
                          +1
                        </span>
                      </button>

                      <div className="w-[1px] h-3 bg-foreground/[0.08] mx-0.5" />

                      <div className="relative group/cal">
                        <input
                          type="date"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          value={todo.due_date || ""}
                          onChange={(e) => {
                            onSetDueDate?.(todo.id, e.target.value || null);
                          }}
                          title="Pick a date"
                        />
                        <button
                          className={`px-2 py-1.5 rounded-[9px] transition-all flex items-center justify-center min-w-[28px] ${
                            todo.due_date &&
                            todo.due_date !==
                              new Date().toLocaleDateString("sv-SE") &&
                            todo.due_date !==
                              new Date(
                                new Date().setDate(new Date().getDate() + 1),
                              ).toLocaleDateString("sv-SE")
                              ? "text-orange-600 bg-orange-500/25 shadow-md font-black scale-105"
                              : "text-muted-foreground/80 hover:bg-foreground/5"
                          }`}
                          title="Select specific date"
                        >
                          <CalendarIcon size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateContent?.(todo.id)}
                    className="px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-bold"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            ) : (
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

                {/* Category & Badges Metadata Row */}
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {categories && todo.category_id && (
                    <span className="text-[9px] text-foreground/30 font-semibold tracking-widest uppercase">
                      {categories.find((c) => c.id === todo.category_id)?.name}
                    </span>
                  )}

                  {!isEditing && todo.planned_date && (
                    <div
                      className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tighter uppercase",
                        (() => {
                          const diff = getDiffDays(todo.planned_date!);
                          if (diff === 0) return "bg-blue-500/10 text-blue-500";
                          if (diff === 1)
                            return "bg-purple-500/10 text-purple-500";
                          return "bg-foreground/5 text-foreground/40";
                        })(),
                      )}
                    >
                      {(() => {
                        const diff = getDiffDays(todo.planned_date!);
                        if (diff === 0) return "D";
                        if (diff === 1) return "D+1";
                        return diff > 0 ? `D+${diff}` : `D${diff}`;
                      })()}
                    </div>
                  )}

                  {!isEditing && todo.due_date && (
                    <div
                      className={cn(
                        "px-1.5 py-0.5 rounded-md border text-[9px] font-bold tracking-tight whitespace-nowrap",
                        (() => {
                          const diff = getDiffDays(todo.due_date!);
                          if (diff < 0)
                            return "bg-foreground/[0.03] text-foreground/40 border-foreground/10";
                          if (diff <= 3)
                            return "bg-rose-500/5 text-rose-500 border-rose-500/10";
                          return "bg-amber-500/5 text-amber-500 border-amber-500/10";
                        })(),
                      )}
                    >
                      {new Date(todo.due_date).toLocaleDateString("ko-KR", {
                        month: "numeric",
                        day: "numeric",
                      })}
                      <span className="mx-1 opacity-20">|</span>
                      {(() => {
                        const diff = getDiffDays(todo.due_date!);
                        if (diff === 0) return "D-Day";
                        return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("할 일을 삭제하시겠습니까?")) {
                  onDelete?.(todo.id);
                }
              }}
              className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl self-start"
              title="Delete"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {!isEditing && todo.notes && (
          <p
            onClick={() => {
              if (onEdit) {
                onEdit(todo.id, todo.content, todo.notes || "");
              }
            }}
            className={`text-[13px] font-normal leading-relaxed mt-1.5 break-words cursor-text transition-colors w-full ${
              todo.is_completed ? "text-muted/30" : "text-muted-foreground/70"
            }`}
          >
            {todo.notes}
          </p>
        )}

        {/* Removed redundant date badge section to simplify UI */}
      </div>
    </motion.div>
  );
}
