"use client";
import { Reorder } from "framer-motion";
import { GripVertical, Edit3, Trash2 } from "lucide-react";
import { Category, Todo } from "@/store/useTodoStore";

interface CategoryListProps {
  categories: Category[];
  activeTodos: Todo[];
  isEditing: boolean;
  editingCatId: string | null;
  editingCatName: string;
  setEditingCatId: (id: string | null) => void;
  setEditingCatName: (name: string) => void;
  setCategories: (categories: Category[]) => void;
  onUpdateCategoryName: (id: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onSelectCategory: (cat: Category | null) => void;
}

export default function CategoryList({
  categories,
  activeTodos,
  isEditing,
  editingCatId,
  editingCatName,
  setEditingCatId,
  setEditingCatName,
  setCategories,
  onUpdateCategoryName,
  onDeleteCategory,
  onSelectCategory,
}: CategoryListProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const filterWindow = (t: Todo) => {
    if (!t.due_date) return true;
    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);
    return d >= thirtyDaysAgo && d <= thirtyDaysLater;
  };

  const inboxTodos = activeTodos
    .filter((t) => !t.category_id)
    .filter(filterWindow);
  const inboxTotal = inboxTodos.length;
  const inboxDone = inboxTodos.filter((t) => t.is_completed).length;
  const inboxPercent =
    inboxTotal > 0 ? Math.round((inboxDone / inboxTotal) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex-grow overflow-y-auto no-scrollbar pb-20">
        {/* Inbox */}
        <div key="inbox">
          <div
            onClick={() =>
              !isEditing &&
              onSelectCategory({
                id: "inbox",
                name: "inbox",
                user_id: "",
                created_at: "",
              })
            }
            className={`category-item group py-5 flex items-center justify-between relative bg-background ${isEditing ? "cursor-default opacity-50" : "cursor-pointer"}`}
          >
            <span className="flex-grow text-left text-[17px] font-light tracking-tight text-foreground/90 lowercase">
              inbox
            </span>
            <div className="flex items-center gap-4 pointer-events-none">
              <span className="text-foreground/100 text-xs tracking-widest">
                {inboxDone}/{inboxTotal}{" "}
                <span className="ml-1 text-[10px]">{inboxPercent}%</span>
              </span>
            </div>
          </div>
          <div className="border-b border-border w-full"></div>
        </div>

        <Reorder.Group
          axis="y"
          values={categories}
          onReorder={setCategories}
          className="flex flex-col"
        >
          {categories.map((cat) => {
            const catTodos = activeTodos
              .filter((t) => t.category_id === cat.id)
              .filter(filterWindow);
            const total = catTodos.length;
            const done = catTodos.filter((t) => t.is_completed).length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const isEditingThis = editingCatId === cat.id;

            return (
              <Reorder.Item
                key={cat.id}
                value={cat}
                dragListener={isEditing && !isEditingThis}
                style={{ position: "relative" }}
              >
                <div
                  onClick={() => {
                    if (isEditing) {
                      if (!isEditingThis) {
                        setEditingCatId(cat.id);
                        setEditingCatName(cat.name);
                      }
                    } else {
                      onSelectCategory(cat);
                    }
                  }}
                  className={`category-item group py-5 flex items-center justify-between relative bg-background ${isEditingThis ? "cursor-default" : "cursor-pointer"}`}
                >
                  {isEditing && !isEditingThis && (
                    <div
                      className="mr-3 text-foreground/20 cursor-grab active:cursor-grabbing"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical size={16} />
                    </div>
                  )}

                  {isEditingThis ? (
                    <div
                      className="flex-grow flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        onBlur={() => onUpdateCategoryName(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onUpdateCategoryName(cat.id);
                          if (e.key === "Escape") setEditingCatId(null);
                        }}
                        className="bg-transparent border-none p-0 text-[17px] font-light tracking-tight text-foreground focus:ring-0 lowercase w-full"
                      />
                    </div>
                  ) : (
                    <span className="flex-grow text-left text-[17px] font-light tracking-tight text-foreground/90 lowercase">
                      {cat.name}
                    </span>
                  )}

                  <div className="flex items-center gap-4">
                    {!isEditing && (
                      <span className="text-foreground/100 text-xs tracking-widest pointer-events-none">
                        {done}/{total}{" "}
                        <span className="ml-1 text-[10px]">{percent}%</span>
                      </span>
                    )}
                    {isEditing && !isEditingThis && (
                      <div
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="text-foreground/20 hover:text-foreground"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(cat.id, cat.name)}
                          className="text-red-500/30 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-b border-border w-full"></div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
    </div>
  );
}
