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
  const inboxCount = activeTodos.filter(
    (t) => !t.category_id && !t.is_completed,
  ).length;

  return (
    <div className="animate-in fade-in duration-700">
      {/* Inbox */}
      <div key="inbox">
        <div className="category-item group py-5 flex items-center justify-between relative">
          <button
            onClick={() =>
              !isEditing &&
              onSelectCategory({
                id: "inbox",
                name: "inbox",
                user_id: "",
                created_at: "",
              })
            }
            className={`flex-grow text-left text-[17px] font-light tracking-tight text-white/90 lowercase ${isEditing ? "cursor-default opacity-50" : ""}`}
          >
            inbox
          </button>
          <div className="flex items-center gap-4">
            <span className="text-white/10 text-xs tracking-widest">
              {String(inboxCount).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="border-b border-white/5 w-full"></div>
      </div>

      <Reorder.Group
        axis="y"
        values={categories}
        onReorder={setCategories}
        className="flex flex-col"
      >
        {categories.map((cat) => {
          const count = activeTodos.filter(
            (t) => t.category_id === cat.id && !t.is_completed,
          ).length;
          const isEditingThis = editingCatId === cat.id;

          return (
            <Reorder.Item
              key={cat.id}
              value={cat}
              dragListener={isEditing && !isEditingThis}
              style={{ position: "relative" }}
            >
              <div className="category-item group py-5 flex items-center justify-between relative bg-black">
                {isEditing && !isEditingThis && (
                  <div className="mr-3 text-white/20 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                  </div>
                )}

                {isEditingThis ? (
                  <div className="flex-grow flex items-center gap-2">
                    <input
                      autoFocus
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      onBlur={() => onUpdateCategoryName(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onUpdateCategoryName(cat.id);
                        if (e.key === "Escape") setEditingCatId(null);
                      }}
                      className="bg-transparent border-none p-0 text-[17px] font-light tracking-tight text-white focus:ring-0 lowercase w-full"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditingCatId(cat.id);
                        setEditingCatName(cat.name);
                      } else {
                        onSelectCategory(cat);
                      }
                    }}
                    className="flex-grow text-left text-[17px] font-light tracking-tight text-white/90 lowercase"
                  >
                    {cat.name}
                  </button>
                )}

                <div className="flex items-center gap-4">
                  {!isEditing && (
                    <span className="text-white/10 text-xs tracking-widest">
                      {String(count).padStart(2, "0")}
                    </span>
                  )}
                  {isEditing && !isEditingThis && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        className="text-white/20 hover:text-white"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `"${cat.name}" 카테고리를 삭제하시겠습니까? 이 카테고리에 속한 할 일은 모두 휴지통으로 이동합니다.`,
                            )
                          ) {
                            onDeleteCategory(cat.id, cat.name);
                          }
                        }}
                        className="text-red-500/30 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-b border-white/5 w-full"></div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
