"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTodoStore, Category } from "@/store/useTodoStore";

// Components
import LoginView from "@/components/auth/LoginView";
import Toast from "@/components/ui/Toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TrashView from "@/components/views/TrashView";
import CategoryList from "@/components/todo/CategoryList";
import CategoryDetailView from "@/components/views/CategoryDetailView";
import CalendarView from "@/components/views/CalendarView";

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
    return <LoginView onLogin={handleGoogleLogin} />;
  }

  const activeTodos = todos.filter((t) => !t.is_deleted);
  const trashTodos = todos.filter((t) => t.is_deleted);

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
        <Header
          view={view}
          setView={setView}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setEditingCatId={setEditingCatId}
        />

        <main className="flex-grow overflow-y-auto no-scrollbar pb-32">
          {view === "trash" ? (
            <TrashView
              trashTodos={trashTodos}
              onEmptyTrash={handleEmptyTrash}
              onRestoreTodo={handleRestoreTodo}
              onPermanentDeleteTodo={permanentlyDeleteTodo}
            />
          ) : view === "category" ? (
            !activeCategory ? (
              <CategoryList
                categories={categories}
                activeTodos={activeTodos}
                isEditing={isEditing}
                editingCatId={editingCatId}
                editingCatName={editingCatName}
                setEditingCatId={setEditingCatId}
                setEditingCatName={setEditingCatName}
                setCategories={setCategories}
                onUpdateCategoryName={handleUpdateCategoryName}
                onDeleteCategory={handleDeleteCategory}
                onSelectCategory={setActiveCategory}
              />
            ) : (
              <CategoryDetailView
                activeCategory={activeCategory}
                onBack={() => setActiveCategory(null)}
                pendingInCat={pendingInCat}
                somedayInCat={somedayInCat}
                completedInCat={completedInCat}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
                editingTodoId={editingTodoId}
                setEditingTodoId={setEditingTodoId}
                editingTodoContent={editingTodoContent}
                setEditingTodoContent={setEditingTodoContent}
                onUpdateTodoContent={handleUpdateTodoContent}
              />
            )
          ) : (
            <CalendarView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              todos={todos}
              categories={categories}
              monthName={monthName}
              daysInMonth={daysInMonth}
              changeMonth={changeMonth}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
            />
          )}
        </main>

        <Footer
          view={view}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleAddTodo={handleAddTodo}
          monthName={monthName}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          useDeadline={useDeadline}
          setUseDeadline={setUseDeadline}
          daysInMonth={daysInMonth}
          changeMonth={changeMonth}
          direction={direction}
          activeCategory={activeCategory}
          showCatMenu={showCatMenu}
          setShowCatMenu={setShowCatMenu}
          selectedCatId={selectedCatId}
          setSelectedCatId={setSelectedCatId}
          categories={categories}
          newCatName={newCatName}
          setNewCatName={setNewCatName}
          handleAddCategory={handleAddCategory}
        />

        <div
          className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02] contrast-150 brightness-100"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpb4eyv049wYz_fDXWVtrc7dcldVVlGptJGf5WIqJ7DNupHq4zAzZajpTy2G503IE3-fiHWVDEhWE4MLhGnRDLnwD7wMjMPgzUvQ-hp8OFhfNgYt9NHXgzrC-Z5tl_aaKYOKD0q1APUmUv2MUn5q9GMYXkEcuEryv7wQ-Fkt-bUmUydIS5jhgkhcMfg5Ud08stHEm5vu_WXdMYRlvFBBMNF45z0xAsGKQws_1uXw1bPrF1aPVYSG_AnZqjOFB91eqKGRvb95J3XIUt')",
          }}
        ></div>

        <Toast show={toast.show} message={toast.message} />
      </div>
    </div>
  );
}
