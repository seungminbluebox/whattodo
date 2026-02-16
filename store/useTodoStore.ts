import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { getNextRecurringDate } from "../lib/dateUtils";

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
  is_deleted: boolean;
  user_id: string;
}

interface TodoState {
  todos: Todo[];
  categories: Category[];
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string, is_completed: boolean) => Promise<void>;
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
