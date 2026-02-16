"use client";
import { Todo } from "@/store/useTodoStore";
import TodoItem from "@/components/todo/TodoItem";

interface TrashViewProps {
  trashTodos: Todo[];
  onEmptyTrash: () => void;
  onRestoreTodo: (id: string, content: string) => void;
  onPermanentDeleteTodo: (id: string) => void;
}

export default function TrashView({
  trashTodos,
  onEmptyTrash,
  onRestoreTodo,
  onPermanentDeleteTodo,
}: TrashViewProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h2 className="text-[32px] font-light text-white tracking-tight leading-none lowercase mt-4">
          🗑️
        </h2>
        {trashTodos.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="text-[11px] font-medium text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest pb-1"
          >
            empty all
          </button>
        )}
      </div>
      <div className="space-y-6">
        {trashTodos.length === 0 ? (
          <p className="text-white/20 text-[13px] italic lowercase">
            trash is empty
          </p>
        ) : (
          trashTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isTrash
              onRestore={onRestoreTodo}
              onPermanentDelete={onPermanentDeleteTodo}
            />
          ))
        )}
      </div>
    </div>
  );
}
