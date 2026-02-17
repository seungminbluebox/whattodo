"use client";
import { Todo, Category } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";
import { ChevronLeft } from "lucide-react";

interface CategoryDetailViewProps {
  activeCategory: Category;
  onBack: () => void;
  pendingInCat: Todo[];
  somedayInCat: Todo[];
  completedInCat: Todo[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
  editingTodoContent: string;
  setEditingTodoContent: (content: string) => void;
  onUpdateTodoContent: (id: string) => void;
}

export default function CategoryDetailView({
  activeCategory,
  onBack,
  pendingInCat,
  somedayInCat,
  completedInCat,
  onToggleTodo,
  onDeleteTodo,
  editingTodoId,
  setEditingTodoId,
  editingTodoContent,
  setEditingTodoContent,
  onUpdateTodoContent,
}: CategoryDetailViewProps) {
  const allTodos = [...pendingInCat, ...somedayInCat, ...completedInCat];
  const total = allTodos.length;
  const done = completedInCat.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] font-medium tracking-tight text-muted hover:text-foreground transition-colors py-1 px-2 -ml-2 rounded-md hover:bg-accent group"
        >
          <ChevronLeft
            size={14}
            strokeWidth={2.5}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>카테고리</span>
        </button>
        <div className="flex flex-col items-end gap-1">
          <div className="text-foreground/40 text-[11px] tracking-widest font-bold uppercase">
            {done} / {total}
          </div>
          <div className="text-foreground/20 text-[9px] tracking-[0.2em] font-medium uppercase">
            {percent}% completed
          </div>
        </div>
      </div>

      <h2 className="text-[32px] font-light text-foreground tracking-tight leading-none lowercase">
        {activeCategory.name}
      </h2>

      <section className="space-y-8 mt-12">
        {/* Scheduled Section */}
        {pendingInCat.length > 0 && (
          <div className="space-y-6">
            <span className="text-[9px] text-foreground/50 uppercase tracking-[0.3em] font-medium block mb-4">
              scheduled
            </span>
            {pendingInCat.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                isEditing={editingTodoId === todo.id}
                editingContent={editingTodoContent}
                setEditingContent={setEditingTodoContent}
                onUpdateContent={onUpdateTodoContent}
                onEdit={(id, content) => {
                  setEditingTodoId(id);
                  setEditingTodoContent(content);
                }}
                setEditingId={setEditingTodoId}
              />
            ))}
          </div>
        )}

        {somedayInCat.length > 0 && (
          <div
            className={`pt-8 ${pendingInCat.length > 0 ? "border-t border-border" : ""} space-y-6`}
          >
            <span className="text-[9px] text-foreground/50 uppercase tracking-[0.3em] font-medium block mb-4">
              someday
            </span>
            {somedayInCat.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                isEditing={editingTodoId === todo.id}
                editingContent={editingTodoContent}
                setEditingContent={setEditingTodoContent}
                onUpdateContent={onUpdateTodoContent}
                onEdit={(id, content) => {
                  setEditingTodoId(id);
                  setEditingTodoContent(content);
                }}
                setEditingId={setEditingTodoId}
              />
            ))}
          </div>
        )}

        {completedInCat.length > 0 && (
          <div className="pt-8 border-t border-border space-y-6">
            <span className="text-[9px] text-foreground/30 uppercase tracking-[0.3em] font-medium block mb-4">
              done
            </span>
            {completedInCat.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                isEditing={editingTodoId === todo.id}
                editingContent={editingTodoContent}
                setEditingContent={setEditingTodoContent}
                onUpdateContent={onUpdateTodoContent}
                onEdit={(id, content) => {
                  setEditingTodoId(id);
                  setEditingTodoContent(content);
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
