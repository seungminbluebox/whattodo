"use client";
import React, { useState, useMemo, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo, Category } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TodayViewProps {
  todos: Todo[];
  categories: Category[];
  dayOffset: number;
  setDayOffset: Dispatch<SetStateAction<number>>;
  onToggleTodo: (id: string, completed: boolean) => void;
  onSetPlannedDate: (id: string, date: string | null) => void;
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
          <span className="text-[11px] text-muted-foreground/50 font-medium tracking-widest uppercase">
            {targetDateStr}
          </span>
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
