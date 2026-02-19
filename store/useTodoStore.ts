import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  getNextRecurringDate,
  getRecurringDateForMonth,
} from "../lib/dateUtils";

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Todo {
  id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  category_id: string | null;
  due_date: string | null;
  is_recurring: boolean;
  recurring_day: number | null;
  notes: string | null;
  is_deleted: boolean;
  user_id: string;
  planned_date: string | null;
}

interface TodoState {
  todos: Todo[];
  categories: Category[];
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  syncRecurringTasks: (baseDate?: string | Date) => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string, is_completed: boolean) => Promise<void>;
  setPlannedDate: (id: string, date: string | null) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  restoreTodo: (id: string) => Promise<void>;
  permanentlyDeleteTodo: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setTodos: (todos: Todo[]) => void;
  setCategories: (categories: Category[]) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  categories: [],
  setTodos: (todos) => set({ todos }),
  setCategories: (categories) => set({ categories }),
  fetchTodos: async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error);
      return;
    }

    set({ todos: data || [] });
    // Fetch 후 반복 일정 동기화
    await get().syncRecurringTasks();
  },
  fetchCategories: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    set({ categories: data || [] });
  },
  syncRecurringTasks: async (baseDate?: string | Date) => {
    const { todos } = get();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 활성화된 반복 일정 정의(규칙) 수집 (삭제된 항목 제외하고 규칙 파악)
    const recurringRules = todos
      .filter((t) => t.is_recurring && t.recurring_day && !t.is_deleted)
      .reduce(
        (acc, t) => {
          const key = `${t.content}-${t.category_id}-${t.recurring_day}`;
          if (!acc[key]) {
            acc[key] = {
              content: t.content,
              category_id: t.category_id,
              recurring_day: t.recurring_day!,
              notes: t.notes,
              min_date: t.due_date, // 처음 생성된(혹은 존재하는 가장 빠른) 날짜 기록
            };
          } else if (
            t.due_date &&
            acc[key].min_date &&
            t.due_date < acc[key].min_date
          ) {
            acc[key].min_date = t.due_date;
          }
          return acc;
        },
        {} as Record<
          string,
          {
            content: string;
            category_id: string | null;
            recurring_day: number;
            notes: string | null;
            min_date: string | null;
          }
        >,
      );

    // baseDate가 없으면 현재 시간을 기준으로 시작
    const now = baseDate ? new Date(baseDate) : new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 현재 기준 달부터 3개월치(rolling window)를 미리 생성
    const newTodos: any[] = [];

    for (const rule of Object.values(recurringRules)) {
      for (let i = 0; i <= 3; i++) {
        let targetMonth = currentMonth + i;
        let targetYear = currentYear;
        if (targetMonth > 12) {
          targetMonth -= 12;
          targetYear += 1;
        }

        const targetDate = getRecurringDateForMonth(
          targetYear,
          targetMonth,
          rule.recurring_day,
        );

        // rule.min_date보다 이전 날짜면 생성하지 않음
        if (rule.min_date && targetDate < rule.min_date) {
          continue;
        }

        // 이미 해당 기한으로 생성된 할 일이 있는지 확인 (완료/미완료/삭제 모두 포함)
        const alreadyExists = todos.some(
          (t) =>
            t.content === rule.content &&
            t.category_id === rule.category_id &&
            t.due_date === targetDate,
        );

        if (!alreadyExists) {
          newTodos.push({
            content: rule.content,
            category_id: rule.category_id,
            due_date: targetDate,
            is_recurring: true,
            recurring_day: rule.recurring_day,
            notes: rule.notes,
            user_id: user.id,
            is_completed: false,
            is_deleted: false,
          });
        }
      }
    }

    if (newTodos.length > 0) {
      const { data, error } = await supabase
        .from("todos")
        .insert(newTodos)
        .select();

      if (!error && data) {
        set((state) => ({ todos: [...data, ...state.todos] }));
      } else {
        console.error("Error syncing recurring tasks:", error);
      }
    }
  },
  addTodo: async (todoData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ ...todoData, user_id: user.id, is_deleted: false }])
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      set((state) => ({ todos: [data, ...state.todos] }));
      // 반복 일정인 경우 현재 추가된 날짜를 기준으로 미래 일정 동기화
      if (data.is_recurring) {
        await get().syncRecurringTasks(data.due_date);
      }
    }
  },
  updateCategory: async (id, updates) => {
    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  },
  updateTodo: async (id, updates) => {
    const { error } = await supabase.from("todos").update(updates).eq("id", id);
    if (error) {
      console.error(error.message);
      return;
    }
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },
  toggleTodo: async (id, is_completed) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !is_completed })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    // 반복 일정 처리: 미완료 -> 완료로 변경될 때만 체크
    if (!is_completed) {
      const targetTodo = get().todos.find((t) => t.id === id);
      if (targetTodo?.is_recurring && targetTodo.recurring_day) {
        // 다음 달 반복 일정 생성
        const nextDate = getNextRecurringDate(targetTodo.recurring_day);

        // 이미 해당 기한으로 생성된 반복 일정이 있는지 확인 (중복 생성 방지)
        const alreadyExists = get().todos.some(
          (t) =>
            t.content === targetTodo.content &&
            t.due_date === nextDate &&
            t.is_recurring,
        );

        if (!alreadyExists) {
          get().addTodo({
            content: targetTodo.content,
            category_id: targetTodo.category_id,
            due_date: nextDate,
            is_recurring: true,
            recurring_day: targetTodo.recurring_day,
          });
        }
      }
    }

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t,
      ),
    }));
  },
  setPlannedDate: async (id, date) => {
    const { error } = await supabase
      .from("todos")
      .update({ planned_date: date })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, planned_date: date } : t,
      ),
    }));
  },
  deleteTodo: async (id) => {
    // 소프트 삭제: is_deleted를 true로 변경
    const { error } = await supabase
      .from("todos")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, is_deleted: true } : t,
      ),
    }));
  },
  restoreTodo: async (id) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_deleted: false })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, is_deleted: false } : t,
      ),
    }));
  },
  permanentlyDeleteTodo: async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));
  },
  emptyTrash: async () => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("is_deleted", true);

    if (error) {
      console.error(error.message);
      return;
    }

    set((state) => ({
      todos: state.todos.filter((t) => !t.is_deleted),
    }));
  },
  addCategory: async (name) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      set((state) => ({ categories: [...state.categories, data] }));
    }
  },
  deleteCategory: async (id) => {
    // 1. 해당 카테고리의 모든 할 일을 휴지통으로 이동 (category_id 제거 및 is_deleted 처리)
    const { error: todoError } = await supabase
      .from("todos")
      .update({ is_deleted: true, category_id: null })
      .eq("category_id", id);

    if (todoError) {
      console.error("Error moving todos to trash:", todoError.message);
    }

    // 2. 카테고리 실제 삭제
    const { error: catError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (catError) {
      console.error("Error deleting category:", catError.message);
      return;
    }

    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      todos: state.todos.map((t) =>
        t.category_id === id
          ? { ...t, category_id: null, is_deleted: true }
          : t,
      ),
    }));
  },
}));
