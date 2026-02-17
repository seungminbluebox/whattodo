"use client";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { registerServiceWorker, subscribeToPush } from "@/lib/pushNotification";

const VIEWS = ["category", "calendar", "trash"] as const;
type ViewType = (typeof VIEWS)[number];

const mainViewVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(2px)",
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    filter: "blur(2px)",
    scale: 0.99,
  }),
};

const viewTransition = {
  x: { type: "spring", stiffness: 800, damping: 60, mass: 0.4 },
  opacity: { duration: 0.12, ease: "easeOut" },
  filter: { duration: 0.12 },
  scale: { type: "spring", stiffness: 800, damping: 60 },
} as const;

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<ViewType>("category");
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
  const [editingTodoNotes, setEditingTodoNotes] = useState("");
  const [direction, setDirection] = useState(0);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const handleViewChange = (newView: ViewType) => {
    const currentIndex = VIEWS.indexOf(view);
    const newIndex = VIEWS.indexOf(newView);
    if (currentIndex !== newIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setView(newView);
      if (newView !== "category") {
        setActiveCategory(null);
        setIsEditing(false);
      }
    }
  };

  const {
    todos,
    categories,
    fetchTodos,
    fetchCategories,
    syncRecurringTasks,
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
    // 캘린더 뷰일 때는 항상 deadline을 사용하도록 설정 (달력 이동 시 동기화도 포함)
    if (view === "calendar") {
      setUseDeadline(true);
      syncRecurringTasks(selectedDate);
    }
  }, [view, selectedDate, syncRecurringTasks]);

  useEffect(() => {
    // 기한이 없으면 반복 설정도 해제
    if (!useDeadline) {
      setIsRecurring(false);
    }
  }, [useDeadline]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        registerServiceWorker().then(() => {
          subscribeToPush();
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        registerServiceWorker().then(() => {
          subscribeToPush();
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchCategories();
    }
  }, [user, fetchTodos, fetchCategories]);

  // 모바일 뒤로가기 버튼 처리
  useEffect(() => {
    const handlePopState = () => {
      if (activeCategory) {
        setActiveCategory(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeCategory]);

  // 카테고리 선택 시 히스토리 추가
  const handleSelectCategory = (cat: Category | null) => {
    if (cat) {
      window.history.pushState({ view: "detail" }, "");
    }
    setActiveCategory(cat);
  };

  const handleBack = () => {
    if (activeCategory) {
      window.history.back();
    }
  };

  const handleUpdateCategoryName = async (id: string) => {
    if (!editingCatName.trim()) return;
    await updateCategory(id, { name: editingCatName.trim() });
    setEditingCatId(null);
    setEditingCatName("");
  };

  const handleUpdateTodoContent = async (id: string) => {
    if (!editingTodoContent.trim()) return;
    await updateTodo(id, {
      content: editingTodoContent.trim(),
      notes: editingTodoNotes.trim() || null,
    });
    setEditingTodoId(null);
    setEditingTodoContent("");
    setEditingTodoNotes("");
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
        redirectTo: window.location.origin + "/whattodo",
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

    let recurringDay: number | null = null;
    if (isRecurring) {
      if (dueDate) {
        const d = new Date(dueDate);
        const lastDayOfMonth = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
        ).getDate();
        // If it's the last day of the month, use 99 for 'last day' logic
        recurringDay = d.getDate() === lastDayOfMonth ? 99 : d.getDate();
      } else {
        recurringDay = new Date().getDate();
      }
    }

    await addTodo({
      content: inputValue,
      due_date: dueDate,
      category_id: finalCatId,
      is_recurring: isRecurring,
      recurring_day: recurringDay,
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

  // 오늘 기준 정보 (일정 필터링용: 오늘 기준 ±30일 이내)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 비교를 위해 시간을 0으로 설정

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  // 카테고리 필터링된 할 일
  const activeCategoryTodos = (
    activeCategory
      ? activeCategory.id === "trash"
        ? trashTodos
        : activeCategory.id === "inbox"
          ? activeTodos.filter((t) => !t.category_id)
          : activeTodos.filter((t) => t.category_id === activeCategory.id)
      : []
  ).filter((t) => {
    // 기한 없는 할 일은 무조건 표시
    if (!t.due_date) return true;

    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);

    // ±30일 이내의 일정만 표시 (범위를 벗어난 완료된/미완료된 항목은 숨김)
    return d >= thirtyDaysAgo && d <= thirtyDaysLater;
  });

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
    <div className="bg-background min-h-screen text-foreground font-display selection:bg-foreground/20 overflow-x-hidden">
      <div className="h-12 w-full"></div>
      <div className="flex flex-col h-[calc(100dvh-3rem)] max-w-md mx-auto px-5 sm:px-8 relative overflow-x-hidden">
        <Header
          view={view}
          setView={handleViewChange}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setEditingCatId={setEditingCatId}
        />

        <main className="flex-grow overflow-x-hidden relative">
          <motion.div
            className="h-full w-full touch-pan-y select-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (activeCategory) return;
              const threshold = 10;
              const velocity = info.velocity.x;
              const offset = info.offset.x;

              if (offset > threshold || velocity > 50) {
                const currentIndex = VIEWS.indexOf(view);
                if (currentIndex > 0) handleViewChange(VIEWS[currentIndex - 1]);
              } else if (offset < -threshold || velocity < -50) {
                const currentIndex = VIEWS.indexOf(view);
                if (currentIndex < VIEWS.length - 1)
                  handleViewChange(VIEWS[currentIndex + 1]);
              }
            }}
            transition={viewTransition}
          >
            <AnimatePresence mode="wait" custom={direction}>
              {view === "trash" ? (
                <motion.div
                  key="trash"
                  custom={direction}
                  variants={mainViewVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={viewTransition}
                  className="h-full overflow-y-auto no-scrollbar pb-60"
                >
                  <TrashView
                    trashTodos={trashTodos}
                    categories={categories}
                    onEmptyTrash={handleEmptyTrash}
                    onRestoreTodo={handleRestoreTodo}
                    onPermanentDeleteTodo={permanentlyDeleteTodo}
                  />
                </motion.div>
              ) : view === "category" ? (
                !activeCategory ? (
                  <motion.div
                    key="categories"
                    custom={direction}
                    variants={mainViewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={viewTransition}
                    className="h-full overflow-y-auto no-scrollbar pb-70"
                  >
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
                      onSelectCategory={handleSelectCategory}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`category-${activeCategory.id}`}
                    initial={{ opacity: 0, x: 15, filter: "blur(2px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -15, filter: "blur(2px)" }}
                    transition={viewTransition}
                    className="h-full overflow-y-auto no-scrollbar pb-60"
                  >
                    <CategoryDetailView
                      activeCategory={activeCategory}
                      onBack={handleBack}
                      pendingInCat={pendingInCat}
                      somedayInCat={somedayInCat}
                      completedInCat={completedInCat}
                      onToggleTodo={toggleTodo}
                      onDeleteTodo={deleteTodo}
                      editingTodoId={editingTodoId}
                      setEditingTodoId={setEditingTodoId}
                      editingTodoContent={editingTodoContent}
                      setEditingTodoContent={setEditingTodoContent}
                      editingTodoNotes={editingTodoNotes}
                      setEditingTodoNotes={setEditingTodoNotes}
                      onUpdateTodoContent={handleUpdateTodoContent}
                    />
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="calendar"
                  custom={direction}
                  variants={mainViewVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={viewTransition}
                  className="h-full overflow-y-auto no-scrollbar pb-50"
                >
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
                    editingTodoId={editingTodoId}
                    setEditingTodoId={setEditingTodoId}
                    editingTodoContent={editingTodoContent}
                    setEditingTodoContent={setEditingTodoContent}
                    editingTodoNotes={editingTodoNotes}
                    setEditingTodoNotes={setEditingTodoNotes}
                    onUpdateTodoContent={handleUpdateTodoContent}
                    direction={direction}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
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
