"use client";
import { Todo, Category } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";

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
  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onBack}
          className="text-white/20 hover:text-white text-[12px] uppercase font-bold tracking-widest"
        >
          ← back
        </button>
      </div>

      <h2 className="text-[32px] font-light text-white tracking-tight leading-none lowercase">
        {activeCategory.name}
      </h2>

      <section className="space-y-8 mt-12">
        {/* Scheduled Section */}
        {pendingInCat.length > 0 && (
          <div className="space-y-6">
            <span className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-medium block mb-4">
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
            className={`pt-8 ${pendingInCat.length > 0 ? "border-t border-white/10" : ""} space-y-6`}
          >
            <span className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-medium block mb-4">
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
          <div className="pt-8 border-t border-white/10 space-y-6">
            <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium block mb-4">
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
