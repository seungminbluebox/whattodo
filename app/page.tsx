"use client";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTodoStore, Category } from "@/store/useTodoStore";

// Components
import LoginView from "@/components/auth/LoginView";
import Toast from "@/components/ui/Toast";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TrashView from "@/components/views/TrashView";
import CategoryList from "@/components/todo/CategoryList";
import CategoryDetailView from "@/components/views/CategoryDetailView";
import CalendarView from "@/components/views/CalendarView";
import TodayView from "@/components/views/TodayView";
import { registerServiceWorker, subscribeToPush } from "@/lib/pushNotification";

const VIEWS = ["today", "category", "calendar", "trash"] as const;
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
  const [view, setView] = useState<ViewType>("today");
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
  const [dayOffset, setDayOffset] = useState(0);
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
    setPlannedDate,
    setDueDate,
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
    // URL 파라미터 확인 (알림 클릭 등으로 들어왔을 때)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      const d = params.get("date");

      if (v === "calendar") {
        handleViewChange("calendar");
        if (d) {
          setSelectedDate(d);
        }
      }
    }
  }, []);

  useEffect(() => {
    let pushInitialized = false;

    async function handlePushSync(userId: string) {
      if (pushInitialized) return;
      pushInitialized = true;
      console.log("Push init started for:", userId);
      const reg = await registerServiceWorker();
      if (reg) {
        await subscribeToPush(userId);
      }
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        handlePushSync(currentUser.id);
      }
    });

    // 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser && !pushInitialized) {
        handlePushSync(currentUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

    // TodayView에서 추가할 때 planned_date 설정
    let plannedDate = null;
    if (view === "today") {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      plannedDate = d.toLocaleDateString("sv-SE");
    }

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
      planned_date: plannedDate,
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

  const fifteenDaysAgo = new Date(today);
  fifteenDaysAgo.setDate(today.getDate() - 15);

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
    // 기한이나 계획일이 없는 할 일은 무조건 표시
    if (!t.due_date && !t.planned_date) return true;

    const targetDate = t.planned_date || t.due_date;
    const d = new Date(targetDate!);
    d.setHours(0, 0, 0, 0);

    // ±30일 이내의 일정만 표시 (범위를 벗어난 완료된/미완료된 항목은 숨김)
    return d >= thirtyDaysAgo && d <= thirtyDaysLater;
  });

  const pendingInCat = activeCategoryTodos
    .filter((t) => (t.due_date || t.planned_date) && !t.is_completed)
    .sort((a, b) => {
      const aDate = a.due_date || a.planned_date;
      const bDate = b.due_date || b.planned_date;
      return new Date(aDate!).getTime() - new Date(bDate!).getTime();
    });
  const somedayInCat = activeCategoryTodos.filter(
    (t) => !t.due_date && !t.planned_date && !t.is_completed,
  );
  const completedInCat = activeCategoryTodos
    .filter((t) => {
      if (!t.is_completed) return false;
      // 완료 후 15일이 지난 항목은 제외 (completed_at 기준)
      if (t.completed_at) {
        const completedDate = new Date(t.completed_at);
        if (completedDate < fifteenDaysAgo) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

  const handleSwipe = (_: any, info: any) => {
    if (activeCategory) return;
    const threshold = 25;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || velocity > 200) {
      const currentIndex = VIEWS.indexOf(view);
      if (currentIndex > 0) handleViewChange(VIEWS[currentIndex - 1]);
    } else if (offset < -threshold || velocity < -50) {
      const currentIndex = VIEWS.indexOf(view);
      if (currentIndex < VIEWS.length - 1)
        handleViewChange(VIEWS[currentIndex + 1]);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground font-display selection:bg-foreground/20 overflow-x-hidden">
      <TopBar
        view={view}
        activeCategory={activeCategory}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setEditingCatId={setEditingCatId}
      />
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
          <AnimatePresence mode="popLayout" custom={direction}>
            {view === "today" ? (
              <motion.div
                key="today"
                custom={direction}
                variants={mainViewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={viewTransition}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                dragMomentum={false}
                onDragEnd={handleSwipe}
                className="h-full overflow-y-auto no-scrollbar pb-60 w-full touch-pan-y select-none"
              >
                <TodayView
                  todos={todos}
                  categories={categories}
                  dayOffset={dayOffset}
                  setDayOffset={setDayOffset}
                  onToggleTodo={toggleTodo}
                  onSetPlannedDate={setPlannedDate}
                  onSetDueDate={setDueDate}
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
            ) : view === "trash" ? (
              <motion.div
                key="trash"
                custom={direction}
                variants={mainViewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={viewTransition}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                dragMomentum={false}
                onDragEnd={handleSwipe}
                className="h-full overflow-y-auto no-scrollbar pb-60 w-full touch-pan-y select-none"
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  dragMomentum={false}
                  onDragEnd={handleSwipe}
                  className="h-full overflow-y-auto no-scrollbar pb-70 w-full touch-pan-y select-none"
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
                  className="h-full overflow-y-auto no-scrollbar pb-60 w-full"
                >
                  <CategoryDetailView
                    activeCategory={activeCategory}
                    onBack={handleBack}
                    pendingInCat={pendingInCat}
                    somedayInCat={somedayInCat}
                    completedInCat={completedInCat}
                    onToggleTodo={toggleTodo}
                    onSetPlannedDate={setPlannedDate}
                    onSetDueDate={setDueDate}
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
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                dragMomentum={false}
                onDragEnd={handleSwipe}
                className="h-full overflow-y-auto no-scrollbar pb-50 w-full touch-pan-y select-none"
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
                  onSetPlannedDate={setPlannedDate}
                  onSetDueDate={setDueDate}
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
