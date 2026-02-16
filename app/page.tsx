"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTodoStore, Todo, Category } from "@/store/useTodoStore";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  GripVertical,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<"category" | "calendar" | "trash">(
    "category",
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [inputValue, setInputValue] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [useDeadline, setUseDeadline] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoContent, setEditingTodoContent] = useState("");
  const [direction, setDirection] = useState(0);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const {
    todos,
    categories,
    fetchTodos,
    fetchCategories,
    addTodo,
    updateTodo,
    addCategory,
    updateCategory,
    toggleTodo,
    deleteTodo,
    restoreTodo,
    permanentlyDeleteTodo,
    emptyTrash,
    deleteCategory,
    setCategories,
  } = useTodoStore();

  useEffect(() => {
    // 캘린더 뷰일 때는 항상 deadline을 사용하도록 설정
    if (view === "calendar") {
      setUseDeadline(true);
    }
  }, [view]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchCategories();
    }
  }, [user, fetchTodos, fetchCategories]);

  const handleUpdateCategoryName = async (id: string) => {
    if (!editingCatName.trim()) return;
    await updateCategory(id, { name: editingCatName.trim() });
    setEditingCatId(null);
    setEditingCatName("");
  };

  const handleUpdateTodoContent = async (id: string) => {
    if (!editingTodoContent.trim()) return;
    await updateTodo(id, { content: editingTodoContent.trim() });
    setEditingTodoId(null);
    setEditingTodoContent("");
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 2000);
  };

  const handleRestoreTodo = async (id: string, content: string) => {
    const todo = todos.find((t) => t.id === id);
    let targetName = "inbox";
    if (todo?.category_id) {
      const cat = categories.find((c) => c.id === todo.category_id);
      if (cat) targetName = cat.name;
    }
    await restoreTodo(id);
    showToast(`"${content}" 항목이 ${targetName}으로 복구되었습니다.`);
  };

  const handleEmptyTrash = async () => {
    if (
      window.confirm(
        "휴지통의 모든 항목을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      await emptyTrash();
      showToast("휴지통을 비웠습니다.");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      window.confirm(
        `"${name}" 카테고리를 삭제하시겠습니까? 이 카테고리에 속한 할 일은 모두 휴지통으로 이동합니다.`,
      )
    ) {
      await deleteCategory(id);
      showToast(`카테고리가 삭제되었습니다. 할 일은 휴지통으로 이동했습니다.`);
    }
  };

  const changeMonth = (offset: number) => {
    setDirection(offset);
    const current = new Date(selectedDate);
    current.setMonth(current.getMonth() + offset);
    // 유지할 수 있는 가장 가까운 날짜로 설정 (예: 3월 31일 -> 2월 28일)
    const nextDate = new Date(
      current.getFullYear(),
      current.getMonth(),
      Math.min(
        new Date(selectedDate).getDate(),
        new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(),
      ),
    );
    setSelectedDate(nextDate.toISOString().split("T")[0]);
  };

  const daysInMonth = useMemo(() => {
    const now = new Date(selectedDate);
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return { firstDay, lastDate, year, month };
  }, [selectedDate]);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(daysInMonth.year, daysInMonth.month),
  );

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) alert(error.message);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // useDeadline이 true면 selectedDate를 사용, false면 null (Someday)
    // 단, calendar view에서는 항상 기한이 있는 것으로 간주하도록 useDeadline을 true로 초기화함
    const dueDate = useDeadline ? selectedDate : null;
    const finalCatId =
      activeCategory?.id === "inbox"
        ? null
        : activeCategory
          ? activeCategory.id
          : selectedCatId;

    await addTodo({
      content: inputValue,
      due_date: dueDate,
      category_id: finalCatId,
      is_recurring: isRecurring,
      recurring_day:
        isRecurring && dueDate
          ? new Date(dueDate).getDate()
          : isRecurring
            ? new Date().getDate()
            : null,
    });

    const targetCatName = activeCategory
      ? activeCategory.name
      : categories.find((c) => c.id === selectedCatId)?.name || "inbox";
    showToast(`${targetCatName}에 추가되었습니다.`);

    setInputValue("");
    setIsRecurring(false);
    // useDeadline은 calendar view가 아닐 때만 초기화
    if (view !== "calendar") {
      setUseDeadline(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    showToast("카테고리가 추가되었습니다.");
    setNewCatName("");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 text-center font-sans selection:bg-blue-500/30">
        <h1 className="text-[40px] font-bold mb-12 tracking-[-0.05em] text-white">
          whattodo
        </h1>
        <button
          onClick={handleGoogleLogin}
          className="border border-white/10 px-10 py-5 hover:bg-white hover:text-black transition-all flex items-center gap-3 font-bold tracking-tight text-[14px] uppercase tracking-[0.1em] rounded-full"
        >
          Continue with Google
        </button>
      </main>
    );
  }

  const activeTodos = todos.filter((t) => !t.is_deleted);
  const trashTodos = todos.filter((t) => t.is_deleted);

  const pendingTodos = activeTodos.filter((t) => t.due_date && !t.is_completed);
  const somedayTodos = activeTodos.filter(
    (t) => !t.due_date && !t.is_completed,
  );
  const completedTodos = activeTodos.filter((t) => t.is_completed);
  const calendarTodos = activeTodos.filter((t) => t.due_date === selectedDate);

  // 카테고리 필터링된 할 일
  const activeCategoryTodos = activeCategory
    ? activeCategory.id === "trash"
      ? trashTodos
      : activeCategory.id === "inbox"
        ? activeTodos.filter((t) => !t.category_id)
        : activeTodos.filter((t) => t.category_id === activeCategory.id)
    : [];

  const pendingInCat = activeCategoryTodos
    .filter((t) => t.due_date && !t.is_completed)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
    );
  const somedayInCat = activeCategoryTodos.filter(
    (t) => !t.due_date && !t.is_completed,
  );
  const completedInCat = activeCategoryTodos
    .filter((t) => t.is_completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

  return (
    <div className="bg-black min-h-screen text-white font-display selection:bg-white/20">
      <div className="h-12 w-full"></div>
      <div className="flex flex-col min-h-[calc(100dvh-3rem)] max-w-md mx-auto px-8 relative overflow-hidden">
        {/* Header Navigation */}
        <header className="flex justify-between items-center pt-4 pb-12">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setView("category");
                setActiveCategory(null);
                setIsEditing(false);
              }}
              className={`text-sm font-medium tracking-tight transition-opacity ${view === "category" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              category
            </button>
            <button
              onClick={() => {
                setView("calendar");
                setActiveCategory(null);
                setIsEditing(false);
              }}
              className={`text-sm font-medium tracking-tight transition-opacity ${view === "calendar" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              calendar
            </button>
            <button
              onClick={() => {
                setView("trash");
                setActiveCategory(null);
                setIsEditing(false);
              }}
              className={`text-sm font-medium tracking-tight transition-opacity ${view === "trash" ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              trash
            </button>
          </div>

          {view === "category" && !activeCategory && (
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setEditingCatId(null);
              }}
              className="text-[13px] font-normal tracking-tight text-white/20 hover:text-white/40 transition-colors lowercase shrink-0"
            >
              {isEditing ? "done" : "edit"}
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto no-scrollbar pb-32">
          {view === "trash" ? (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="flex justify-between items-end">
                <h2 className="text-[32px] font-light text-white tracking-tight leading-none lowercase">
                  trash
                </h2>
                {trashTodos.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
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
                    <div
                      key={todo.id}
                      className="flex items-start group min-h-[48px]"
                    >
                      <div className="w-1 h-1 bg-white/20 rounded-full mt-[10px] mr-4 flex-shrink-0"></div>
                      <div className="flex-grow flex items-start justify-between gap-4">
                        <div className="flex flex-col min-w-0">
                          <p className="text-[14px] font-normal leading-relaxed text-white/50 break-words">
                            {todo.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(`Restore "${todo.content}"?`)
                              ) {
                                await handleRestoreTodo(todo.id, todo.content);
                              }
                            }}
                            className="p-2 text-white/40 hover:text-white transition-colors"
                            title="Restore"
                          >
                            <RotateCcw size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Permanently delete?")) {
                                permanentlyDeleteTodo(todo.id);
                              }
                            }}
                            className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                            title="Permanently Delete"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : view === "category" ? (
            !activeCategory ? (
              /* Group List View */
              <div className="animate-in fade-in duration-700">
                {/* Inbox / Uncategorized - Not reorderable */}
                {(() => {
                  const inboxCount = activeTodos.filter(
                    (t) => !t.category_id && !t.is_completed,
                  ).length;
                  return (
                    <div key="inbox">
                      <div className="category-item group py-5 flex items-center justify-between relative">
                        <button
                          onClick={() =>
                            !isEditing &&
                            setActiveCategory({
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
                      <div className="hairline-divider w-full"></div>
                    </div>
                  );
                })()}

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
                                onChange={(e) =>
                                  setEditingCatName(e.target.value)
                                }
                                onBlur={() => handleUpdateCategoryName(cat.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleUpdateCategoryName(cat.id);
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
                                  setActiveCategory(cat);
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
                                  onClick={() =>
                                    handleDeleteCategory(cat.id, cat.name)
                                  }
                                  className="text-red-500/30 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="hairline-divider w-full"></div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
            ) : (
              /* Detail View */
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => setActiveCategory(null)}
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
                      {pendingInCat.map((todo) => {
                        const dueDate = new Date(todo.due_date!);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diffTime = dueDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24),
                        );

                        return (
                          <div key={todo.id} className="flex items-start group">
                            <button
                              onClick={() =>
                                toggleTodo(todo.id, todo.is_completed)
                              }
                              className="w-4 h-4 rounded-full border border-white/20 mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center hover:border-white transition-colors"
                            >
                              <div className="w-1.5 h-1.5 bg-white/0 rounded-full group-hover:bg-white/10 transition-colors"></div>
                            </button>
                            <div className="flex-grow flex items-start justify-between">
                              <div className="flex flex-col flex-grow">
                                {editingTodoId === todo.id ? (
                                  <input
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-[14px] font-normal leading-relaxed text-white w-full p-0"
                                    value={editingTodoContent}
                                    onChange={(e) =>
                                      setEditingTodoContent(e.target.value)
                                    }
                                    onBlur={() =>
                                      handleUpdateTodoContent(todo.id)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleUpdateTodoContent(todo.id);
                                      if (e.key === "Escape") {
                                        setEditingTodoId(null);
                                        setEditingTodoContent("");
                                      }
                                    }}
                                  />
                                ) : (
                                  <p
                                    onClick={() => {
                                      setEditingTodoId(todo.id);
                                      setEditingTodoContent(todo.content);
                                    }}
                                    className="text-[14px] font-normal leading-relaxed text-white/90 cursor-text"
                                  >
                                    {todo.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                                  <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-medium whitespace-nowrap">
                                    {new Date(
                                      todo.due_date!,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span
                                    className={`text-[9px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap ml-3 ${
                                      diffDays <= 3
                                        ? "text-red-500 bg-red-500/10"
                                        : diffDays === 0
                                          ? "text-white/80 bg-white/5"
                                          : "text-white/20"
                                    }`}
                                  >
                                    {diffDays === 0
                                      ? "today"
                                      : diffDays > 0
                                        ? `d-${diffDays}`
                                        : `d+${Math.abs(diffDays)}`}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  if (window.confirm("Move to trash?")) {
                                    await deleteTodo(todo.id);
                                    showToast("휴지통으로 이동되었습니다.");
                                  }
                                }}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                        <div key={todo.id} className="flex items-start group">
                          <button
                            onClick={() =>
                              toggleTodo(todo.id, todo.is_completed)
                            }
                            className="w-4 h-4 rounded-full border border-white/20 mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center hover:border-white transition-colors"
                          >
                            <div className="w-1.5 h-1.5 bg-white/0 rounded-full group-hover:bg-white/10 transition-colors"></div>
                          </button>
                          <div className="flex-grow flex items-start justify-between">
                            <div className="flex flex-col flex-grow">
                              {editingTodoId === todo.id ? (
                                <input
                                  autoFocus
                                  className="bg-transparent border-none outline-none text-[14px] font-normal leading-relaxed text-white w-full p-0"
                                  value={editingTodoContent}
                                  onChange={(e) =>
                                    setEditingTodoContent(e.target.value)
                                  }
                                  onBlur={() =>
                                    handleUpdateTodoContent(todo.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateTodoContent(todo.id);
                                    if (e.key === "Escape") {
                                      setEditingTodoId(null);
                                      setEditingTodoContent("");
                                    }
                                  }}
                                />
                              ) : (
                                <p
                                  onClick={() => {
                                    setEditingTodoId(todo.id);
                                    setEditingTodoContent(todo.content);
                                  }}
                                  className="text-[14px] font-normal leading-relaxed text-white/90 cursor-text"
                                >
                                  {todo.content}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm("Move to trash?")) {
                                  await deleteTodo(todo.id);
                                  showToast("휴지통으로 이동되었습니다.");
                                }
                              }}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 transition-all ml-4"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {completedInCat.length > 0 && (
                    <div className="pt-8 border-t border-white/10 space-y-6">
                      <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium block mb-4">
                        done
                      </span>
                      {completedInCat.map((todo) => (
                        <div key={todo.id} className="flex items-start group">
                          <button
                            onClick={() =>
                              toggleTodo(todo.id, todo.is_completed)
                            }
                            className="w-4 h-4 rounded-full border border-white/40 mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center bg-white/10"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </button>
                          <div className="flex-grow flex items-start justify-between">
                            <div className="flex flex-col flex-grow">
                              {editingTodoId === todo.id ? (
                                <input
                                  autoFocus
                                  className="bg-transparent border-none outline-none text-[14px] font-normal leading-relaxed text-white w-full p-0"
                                  value={editingTodoContent}
                                  onChange={(e) =>
                                    setEditingTodoContent(e.target.value)
                                  }
                                  onBlur={() =>
                                    handleUpdateTodoContent(todo.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateTodoContent(todo.id);
                                    if (e.key === "Escape") {
                                      setEditingTodoId(null);
                                      setEditingTodoContent("");
                                    }
                                  }}
                                />
                              ) : (
                                <p
                                  onClick={() => {
                                    setEditingTodoId(todo.id);
                                    setEditingTodoContent(todo.content);
                                  }}
                                  className="text-[14px] font-normal leading-relaxed text-white/30 cursor-text line-through decoration-white/30"
                                >
                                  {todo.content}
                                </p>
                              )}
                              {todo.due_date && (
                                <span className="text-[10px] text-white/10 uppercase tracking-[0.1em] font-medium mt-1">
                                  {new Date(todo.due_date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm("Move to trash?")) {
                                  await deleteTodo(todo.id);
                                  showToast("휴지통으로 이동되었습니다.");
                                }
                              }}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 transition-all ml-4"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )
          ) : (
            /* Calendar View */
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
                  const hasTasks = todos.some((t) => t.due_date === dateStr);

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
                        hasTasks && (
                          <div className="calendar-dot mt-1 opacity-40"></div>
                        )
                      )}
                    </button>
                  );
                })}
              </div>

              <section className="space-y-6 pb-24 animate-in slide-in-from-bottom-6 duration-1000">
                {calendarTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start group">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.is_completed)}
                      className={`w-4 h-4 rounded-full border border-white/20 mt-[3px] mr-3 flex-shrink-0 flex items-center justify-center hover:border-white transition-colors ${todo.is_completed ? "bg-white/10" : ""}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-all ${todo.is_completed ? "bg-white" : "bg-white/0 group-hover:bg-white/10"}`}
                      ></div>
                    </button>
                    <div className="flex-grow flex items-start justify-between">
                      <div>
                        <p
                          className={`text-[14px] font-normal leading-relaxed ${todo.is_completed ? "text-white/20 line-through decoration-white/30" : "text-white/90"}`}
                        >
                          {todo.content}
                        </p>
                        {todo.category_id && (
                          <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1 block">
                            {
                              categories.find((c) => c.id === todo.category_id)
                                ?.name
                            }
                          </span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm("Move to trash?")) {
                            await deleteTodo(todo.id);
                            showToast("휴지통으로 이동되었습니다.");
                          }
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 transition-all ml-4"
                        title="Delete"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                {calendarTodos.length === 0 && (
                  <p className="text-white/10 text-[13px] lowercase font-light tracking-wide italic">
                    nothing planned for this day
                  </p>
                )}
              </section>
            </div>
          )}
        </main>

        {/* Footer */}
        {view !== "trash" && (
          <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-8 pb-12 pt-8 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="flex flex-col border-b border-white/10 focus-within:border-white/40 transition-colors pb-3">
                <div className="flex items-center justify-between gap-4">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[15px] focus:ring-0 placeholder:text-white/20 text-white font-light p-0 transition-all"
                    placeholder={
                      view === "calendar"
                        ? `New task for ${monthName.slice(0, 3)} ${new Date(selectedDate).getDate()}...`
                        : "Add a new task..."
                    }
                    type="text"
                  />
                  <AnimatePresence>
                    {inputValue.trim() && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="submit"
                        className="text-white hover:text-white/80 transition-colors shrink-0"
                      >
                        <Plus size={18} strokeWidth={2} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-4 mt-3 h-4">
                  {view !== "calendar" && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${useDeadline ? "text-white" : "text-white/20 hover:text-white/40"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${useDeadline ? "bg-white" : "bg-transparent border border-white/20"}`}
                        ></div>
                        {useDeadline
                          ? new Date(selectedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "set date"}
                      </button>
                      {showDatePicker && (
                        <div
                          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
                          onClick={() => {
                            setUseDeadline(false);
                            setShowDatePicker(false);
                          }}
                        >
                          <div
                            className="relative w-[340px] h-[500px] bg-[#0f0f0f] border border-white/20 rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeMonth(-1);
                                }}
                                className="text-white/40 hover:text-white p-2 w-10 h-10 flex items-center justify-center transition-all bg-white/5 rounded-full"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <div className="flex-1 text-center">
                                <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-white">
                                  {monthName} {daysInMonth.year}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeMonth(1);
                                }}
                                className="text-white/40 hover:text-white p-2 w-10 h-10 flex items-center justify-center transition-all bg-white/5 rounded-full"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                              <AnimatePresence
                                initial={false}
                                custom={direction}
                                mode="popLayout"
                              >
                                <motion.div
                                  key={`${daysInMonth.year}-${daysInMonth.month}`}
                                  custom={direction}
                                  initial={{
                                    x: direction > 0 ? 50 : -50,
                                    opacity: 0,
                                  }}
                                  animate={{ x: 0, opacity: 1 }}
                                  exit={{
                                    x: direction > 0 ? -50 : 50,
                                    opacity: 0,
                                  }}
                                  transition={{
                                    x: {
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 30,
                                    },
                                    opacity: { duration: 0.2 },
                                  }}
                                  className="w-full"
                                >
                                  <div className="grid grid-cols-7 gap-1 text-center content-start">
                                    {["S", "M", "T", "W", "T", "F", "S"].map(
                                      (d, i) => (
                                        <div
                                          key={`dp-${d}-${i}`}
                                          className="h-8 flex items-center justify-center text-[9px] font-bold text-white/20 uppercase tracking-widest"
                                        >
                                          {d}
                                        </div>
                                      ),
                                    )}
                                    {Array.from({
                                      length: daysInMonth.firstDay,
                                    }).map((_, i) => (
                                      <div
                                        key={`dp-empty-${i}`}
                                        className="h-9"
                                      ></div>
                                    ))}
                                    {Array.from({
                                      length: daysInMonth.lastDate,
                                    }).map((_, i) => {
                                      const day = i + 1;
                                      const dateStr = `${daysInMonth.year}-${String(daysInMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                      const isSel = selectedDate === dateStr;
                                      return (
                                        <button
                                          key={`dp-day-${day}`}
                                          type="button"
                                          onClick={() => {
                                            setSelectedDate(dateStr);
                                          }}
                                          className={`h-9 text-[13px] rounded-xl transition-all flex items-center justify-center ${isSel ? "bg-white text-black font-bold scale-105" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                                        >
                                          {day}
                                        </button>
                                      );
                                    })}
                                    {Array.from({
                                      length:
                                        42 -
                                        daysInMonth.firstDay -
                                        daysInMonth.lastDate,
                                    }).map((_, i) => (
                                      <div
                                        key={`dp-trailing-${i}`}
                                        className="h-9"
                                      ></div>
                                    ))}
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </div>

                            <div className="mt-4 pt-6 border-t border-white/5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setUseDeadline(true);
                                  setShowDatePicker(false);
                                }}
                                className="w-full py-3.5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all bg-white text-black mb-2"
                              >
                                Select Date
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUseDeadline(false);
                                  setShowDatePicker(false);
                                }}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                              >
                                Set as Someday
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!activeCategory && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCatMenu(!showCatMenu)}
                        className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${selectedCatId ? "text-white" : "text-white/20 hover:text-white/40"}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${selectedCatId ? "bg-white" : "bg-transparent border border-white/20"}`}
                        ></div>
                        {selectedCatId
                          ? categories.find((c) => c.id === selectedCatId)?.name
                          : "select category"}
                      </button>
                      {showCatMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-[50]"
                            onClick={() => setShowCatMenu(false)}
                          />
                          <div className="absolute bottom-full mb-4 left-0 w-48 bg-[#0a0a0a] border border-white/20 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-[51]">
                            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCatId(null);
                                  setShowCatMenu(false);
                                }}
                                className="w-full text-left p-2 text-[11px] text-white/30 hover:text-white transition-all lowercase"
                              >
                                no category
                              </button>
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCatId(cat.id);
                                    setShowCatMenu(false);
                                  }}
                                  className={`w-full text-left p-2 text-[11px] transition-all lowercase ${selectedCatId === cat.id ? "text-white font-bold" : "text-white/40 hover:text-white"}`}
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {view === "category" && !activeCategory && (
                <div className="flex justify-between items-center opacity-80 gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory(e);
                        }
                      }}
                      placeholder="add category"
                      className="bg-transparent border-none p-0 text-[13px] font-normal tracking-tight text-white/40 focus:ring-0 placeholder:text-white/20 lowercase flex-1 min-w-0"
                    />
                    {newCatName.trim() && (
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="text-white/40 hover:text-white transition-colors shrink-0"
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {view === "category" && activeCategory && (
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => supabase.auth.signOut()}
                    className="text-[11px] font-medium text-white/10 hover:text-white/30 transition-colors uppercase tracking-widest"
                  >
                    sign out
                  </button>
                </div>
              )}
            </form>
          </footer>
        )}

        <div
          className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02] contrast-150 brightness-100"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpb4eyv049wYz_fDXWVtrc7dcldVVlGptJGf5WIqJ7DNupHq4zAzZajpTy2G503IE3-fiHWVDEhWE4MLhGnRDLnwD7wMjMPgzUvQ-hp8OFhfNgYt9NHXgzrC-Z5tl_aaKYOKD0q1APUmUv2MUn5q9GMYXkEcuEryv7wQ-Fkt-bUmUydIS5jhgkhcMfg5Ud08stHEm5vu_WXdMYRlvFBBMNF45z0xAsGKQws_1uXw1bPrF1aPVYSG_AnZqjOFB91eqKGRvb95J3XIUt')",
          }}
        ></div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
            >
              <p className="text-[12px] text-white/90 font-medium tracking-tight whitespace-nowrap">
                {toast.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
