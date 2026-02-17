"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Todo, Category } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";

interface CalendarViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todos: Todo[];
  categories: Category[];
  monthName: string;
  daysInMonth: {
    firstDay: number;
    lastDate: number;
    year: number;
    month: number;
  };
  changeMonth: (offset: number) => void;
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
  editingTodoContent: string;
  setEditingTodoContent: (content: string) => void;
  editingTodoNotes: string;
  setEditingTodoNotes: (notes: string) => void;
  onUpdateTodoContent: (id: string) => void;
  direction: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(2px)",
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    filter: "blur(2px)",
    scale: 0.99,
  }),
};

const springTransition = {
  x: { type: "spring", stiffness: 800, damping: 60, mass: 0.4 },
  opacity: { duration: 0.12, ease: "easeOut" },
  filter: { duration: 0.12 },
  scale: { type: "spring", stiffness: 800, damping: 60 },
} as const;

export default function CalendarView({
  selectedDate,
  setSelectedDate,
  todos,
  categories,
  monthName,
  daysInMonth,
  changeMonth,
  onToggleTodo,
  onDeleteTodo,
  editingTodoId,
  setEditingTodoId,
  editingTodoContent,
  setEditingTodoContent,
  editingTodoNotes,
  setEditingTodoNotes,
  onUpdateTodoContent,
  direction,
}: CalendarViewProps) {
  const calendarTodos = todos.filter(
    (t) => t.due_date === selectedDate && !t.is_deleted,
  );

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="mt-2 mb-8 flex items-center justify-center space-x-12">
        <button
          onClick={() => changeMonth(-1)}
          className="text-foreground/20 hover:text-foreground transition-colors p-2"
        >
          <span className="text-xs">←</span>
        </button>
        <button
          onClick={() =>
            setSelectedDate(new Date().toISOString().split("T")[0])
          }
          className="text-[12px] font-bold text-foreground uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
        >
          {daysInMonth.year}년 {daysInMonth.month + 1}월
        </button>
        <button
          onClick={() => changeMonth(1)}
          className="text-foreground/20 hover:text-foreground transition-colors p-2"
        >
          <span className="text-xs">→</span>
        </button>
      </div>

      <div className="relative overflow-hidden mb-8 px-2">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`${daysInMonth.year}-${daysInMonth.month}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            dragMomentum={false}
            className="touch-pan-y"
            onDragEnd={(_, info) => {
              const threshold = 10;
              const velocity = info.velocity.x;
              const offset = info.offset.x;

              if (offset > threshold || velocity > 50) {
                changeMonth(-1);
              } else if (offset < -threshold || velocity < -50) {
                changeMonth(1);
              }
            }}
            transition={springTransition}
          >
            <div className="grid grid-cols-7 gap-y-2 text-center select-none">
              {["S", "m", "t", "w", "t", "f", "s"].map((d, i) => (
                <div
                  key={`${d}-${i}`}
                  className="text-[9px] font-black text-muted uppercase tracking-[0.3em] pb-3"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-11"></div>
              ))}

              {Array.from({ length: daysInMonth.lastDate }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${daysInMonth.year}-${String(daysInMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = selectedDate === dateStr;
                const isToday =
                  new Date().toISOString().split("T")[0] === dateStr;
                const hasTasks = todos.some(
                  (t) => t.due_date === dateStr && !t.is_deleted,
                );

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className="relative flex flex-col items-center justify-start h-11 group focus:outline-none pointer-events-auto"
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-[10px] transition-all duration-300 ${
                        isSelected
                          ? "bg-foreground text-background font-bold shadow-lg scale-110"
                          : isToday
                            ? "bg-accent text-foreground font-bold"
                            : "text-foreground group-hover:bg-accent/50"
                      }`}
                    >
                      <span className="text-[13px]">{day}</span>
                    </div>
                    {/* Indicator container with fixed height to prevent layout shift */}
                    <div className="h-3 flex items-center justify-center mt-0.5">
                      {!isSelected && hasTasks && (
                        <div
                          className={`w-0.5 h-0.5 rounded-full ${isToday ? "bg-foreground" : "bg-muted"}`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <section className="space-y-6 animate-in slide-in-from-bottom-6 duration-1000">
        {calendarTodos.map((todo) => (
          <div
            key={todo.id}
            className="pb-4 border-b border-border/50 last:border-0"
          >
            <TodoItem
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
              isEditing={editingTodoId === todo.id}
              editingContent={editingTodoContent}
              setEditingContent={setEditingTodoContent}
              editingNotes={editingTodoNotes}
              setEditingNotes={setEditingTodoNotes}
              onUpdateContent={onUpdateTodoContent}
              onEdit={(id, content, notes) => {
                setEditingTodoId(id);
                setEditingTodoContent(content);
                setEditingTodoNotes(notes);
              }}
              setEditingId={setEditingTodoId}
            />
          </div>
        ))}
        {calendarTodos.length === 0 && (
          <p className="text-foreground/10 text-[13px] lowercase font-light tracking-wide italic">
            nothing planned for this day
          </p>
        )}
      </section>
    </div>
  );
}
