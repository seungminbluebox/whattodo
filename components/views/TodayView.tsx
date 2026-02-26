"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo, Category } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";
import { ChevronLeft, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface TodayViewProps {
  todos: Todo[];
  categories: Category[];
  dayOffset: number;
  setDayOffset: Dispatch<SetStateAction<number>>;
  onToggleTodo: (id: string, completed: boolean) => void;
  onSetPlannedDate: (id: string, date: string | null) => void;
  onSetDueDate: (id: string, date: string | null) => void;
  onDeleteTodo: (id: string) => void;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
  editingTodoContent: string;
  setEditingTodoContent: (content: string) => void;
  editingTodoNotes: string;
  setEditingTodoNotes: (notes: string) => void;
  onUpdateTodoContent: (id: string) => void;
}

export default function TodayView({
  todos,
  categories,
  dayOffset,
  setDayOffset,
  onToggleTodo,
  onSetPlannedDate,
  onSetDueDate,
  onDeleteTodo,
  editingTodoId,
  setEditingTodoId,
  editingTodoContent,
  setEditingTodoContent,
  editingTodoNotes,
  setEditingTodoNotes,
  onUpdateTodoContent,
}: TodayViewProps) {
  const targetDateStr = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  }, [dayOffset]);

  const targetDateLabel = useMemo(() => {
    if (dayOffset === -1) return "어제";
    if (dayOffset === 0) return "오늘";
    if (dayOffset === 1) return "내일";

    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  }, [dayOffset]);

  const filteredTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        (todo.planned_date === targetDateStr ||
          todo.due_date === targetDateStr) &&
        !todo.is_deleted,
    );
  }, [todos, targetDateStr]);

  const pendingTodos = filteredTodos.filter((t) => !t.is_completed);
  const completedTodos = filteredTodos.filter((t) => t.is_completed);

  const stats = useMemo(() => {
    const total = filteredTodos.length;
    const done = completedTodos.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [filteredTodos, completedTodos]);

  const prevPercentRef = useRef(stats.percent);

  useEffect(() => {
    // 0 -> 100% 가 되거나, 할 일이 있는 상태에서 100%에 도달했을 때 축하
    if (
      stats.percent === 100 &&
      stats.total > 0 &&
      prevPercentRef.current < 100
    ) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
    prevPercentRef.current = stats.percent;
  }, [stats.percent, stats.total]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 mt-4">
        <button
          onClick={() => setDayOffset((prev) => Math.max(-1, prev - 1))}
          disabled={dayOffset <= -1}
          className="p-2 hover:bg-accent rounded-full transition-colors text-muted hover:text-foreground disabled:opacity-0"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[28px] font-light text-foreground tracking-tight leading-none lowercase">
            {targetDateLabel}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/50 font-medium tracking-widest uppercase">
              {targetDateStr}
            </span>
            {stats.total > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground/20">•</span>
                <span className="text-[11px] text-blue-500/60 font-bold tracking-widest uppercase">
                  {stats.done}/{stats.total} {stats.percent}%
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setDayOffset((prev) => Math.min(1, prev + 1))}
          disabled={dayOffset >= 1}
          className="p-2 hover:bg-accent rounded-full transition-colors text-muted hover:text-foreground disabled:opacity-0"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      <section className="space-y-8">
        {pendingTodos.length > 0 ? (
          <div className="space-y-4">
            {pendingTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                categories={categories}
                onToggle={onToggleTodo}
                onSetPlannedDate={onSetPlannedDate}
                onSetDueDate={onSetDueDate}
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
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
            <p className="text-[15px] font-light italic lowercase tracking-wide">
              {dayOffset === 0
                ? filteredTodos.length > 0
                  ? "할 일을 다 마치셨네요 오늘도 수고하셨어요"
                  : "아직 오늘 계획한 일이 없어요"
                : "계획된 일이 없습니다"}
            </p>
            {filteredTodos.length === 0 && (
              <p className="text-[12px] mt-2 lowercase">
                다른 카테고리에서 할 일을 가져와보세요
              </p>
            )}
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="pt-8 border-t border-border/50 space-y-4">
            <span className="text-[9px] text-foreground/30 uppercase tracking-[0.3em] font-medium block mb-4">
              completed
            </span>
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                categories={categories}
                onToggle={onToggleTodo}
                onSetPlannedDate={onSetPlannedDate}
                onSetDueDate={onSetDueDate}
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
