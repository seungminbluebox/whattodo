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
  direction: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

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
  direction,
}: CalendarViewProps) {
  const calendarTodos = todos.filter(
    (t) => t.due_date === selectedDate && !t.is_deleted,
  );

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="mt-4 mb-12 flex items-center justify-center space-x-12">
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
          className="text-[11px] font-medium text-foreground uppercase tracking-[0.4em] hover:opacity-60 transition-opacity"
        >
          {daysInMonth.year}/{String(daysInMonth.month + 1).padStart(2, "0")}
        </button>
        <button
          onClick={() => changeMonth(1)}
          className="text-foreground/20 hover:text-foreground transition-colors p-2"
        >
          <span className="text-xs">→</span>
        </button>
      </div>

      <div className="relative overflow-hidden mb-16 px-2">
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
            dragElastic={1}
            onDragEnd={(_, info) => {
              const threshold = 50;
              const velocity = info.velocity.x;
              const offset = info.offset.x;

              if (offset > threshold || velocity > 500) {
                changeMonth(-1);
              } else if (offset < -threshold || velocity < -500) {
                changeMonth(1);
              }
            }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="grid grid-cols-7 gap-y-2 text-center pointer-events-none">
              {["S", "m", "t", "w", "t", "f", "s"].map((d, i) => (
                <div
                  key={`${d}-${i}`}
                  className="text-[9px] font-medium text-foreground/20 uppercase tracking-widest pb-4"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12"></div>
              ))}

              {Array.from({ length: daysInMonth.lastDate }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${daysInMonth.year}-${String(daysInMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = selectedDate === dateStr;
                const hasTasks = todos.some(
                  (t) => t.due_date === dateStr && !t.is_deleted,
                );

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className="relative flex flex-col items-center justify-start h-12 group focus:outline-none pointer-events-auto"
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                        isSelected
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground/40 group-hover:text-foreground/70"
                      }`}
                    >
                      <span className="text-[13px]">{day}</span>
                    </div>
                    {/* Indicator container with fixed height to prevent layout shift */}
                    <div className="h-4 flex items-center justify-center">
                      {!isSelected && hasTasks && (
                        <div className="w-1 h-1 bg-foreground/70 rounded-full shadow-[0_0_3px_rgba(255,255,255,0.4)]"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <section className="space-y-6 pb-24 animate-in slide-in-from-bottom-6 duration-1000">
        {calendarTodos.map((todo) => (
          <div
            key={todo.id}
            className="pb-4 border-b border-border/50 last:border-0"
          >
            <TodoItem
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
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
