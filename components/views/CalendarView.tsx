"use client";
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
}

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
}: CalendarViewProps) {
  const calendarTodos = todos.filter(
    (t) => t.due_date === selectedDate && !t.is_deleted,
  );

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="mt-4 mb-12 flex items-center justify-center space-x-12">
        <button
          onClick={() => changeMonth(-1)}
          className="text-white/20 hover:text-white transition-colors p-2"
        >
          <span className="text-xs">←</span>
        </button>
        <h2 className="text-[11px] font-medium text-white uppercase tracking-[0.4em]">
          {monthName} {daysInMonth.year}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="text-white/20 hover:text-white transition-colors p-2"
        >
          <span className="text-xs">→</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-8 text-center mb-16">
        {["S", "m", "t", "w", "t", "f", "s"].map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-[9px] font-medium text-white/20 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
          <div key={`empty-${i}`}></div>
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
              className="relative flex flex-col items-center justify-center py-1 group focus:outline-none"
            >
              <span
                className={`text-[13px] transition-all ${isSelected ? "text-white font-medium" : "text-white/40 group-hover:text-white/70"}`}
              >
                {day}
              </span>
              {isSelected ? (
                <div className="calendar-dot mt-1 bg-white shadow-[0_0_4px_white]"></div>
              ) : (
                hasTasks && <div className="calendar-dot mt-1 opacity-40"></div>
              )}
            </button>
          );
        })}
      </div>

      <section className="space-y-6 pb-24 animate-in slide-in-from-bottom-6 duration-1000">
        {calendarTodos.map((todo) => (
          <div
            key={todo.id}
            className="pb-4 border-b border-white/5 last:border-0"
          >
            <TodoItem
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
            />
          </div>
        ))}
        {calendarTodos.length === 0 && (
          <p className="text-white/10 text-[13px] lowercase font-light tracking-wide italic">
            nothing planned for this day
          </p>
        )}
      </section>
    </div>
  );
}
