import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTodoStore } from "../store/useTodoStore";
import { supabase } from "../lib/supabase";

// Supabase 모킹
vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe("Todo Store Logic", () => {
  beforeEach(() => {
    useTodoStore.setState({ todos: [] });
    vi.clearAllMocks();
  });

  it("fetchTodos는 DB에서 데이터를 가져와 스토어를 업데이트해야 함", async () => {
    const mockData = [
      {
        id: "1",
        content: "Test 1",
        is_completed: false,
        created_at: "2024-01-01",
        category_id: null,
        due_date: null,
        is_recurring: false,
        recurring_day: null,
        user_id: "user123",
        is_deleted: false,
      },
    ];

    // 모킹 데이터 설정
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    });

    await useTodoStore.getState().fetchTodos();
    expect(useTodoStore.getState().todos).toEqual(mockData);
  });

  it("새로운 할 일을 추가하면 리스트 맨 앞에 위치해야 함", async () => {
    const mockTodo = {
      id: "2",
      content: "New Todo",
      is_completed: false,
      created_at: "2024-01-02",
      category_id: null,
      due_date: null,
      is_recurring: false,
      recurring_day: null,
      user_id: "user123",
      is_deleted: false,
    };

    (supabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockTodo, error: null })),
        })),
      })),
    });

    await useTodoStore.getState().addTodo({ content: "New Todo" });
    const todos = useTodoStore.getState().todos;
    expect(todos.length).toBe(1);
    expect(todos[0]).toEqual(mockTodo);
  });

  it("toggleTodo는 DB의 상태를 업데이트하고 스토어를 변경해야 함", async () => {
    const initialTodo = {
      id: "1",
      content: "Test",
      is_completed: false,
      created_at: "2024-01-01",
      category_id: null,
      due_date: null,
      is_recurring: false,
      recurring_day: null,
      user_id: "user123",
      is_deleted: false,
    };
    useTodoStore.setState({ todos: [initialTodo] });

    (supabase.from as any).mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    await useTodoStore.getState().toggleTodo("1", false);

    const todos = useTodoStore.getState().todos;
    expect(todos[0].is_completed).toBe(true);
  });

  it("deleteTodo는 DB에서 소프트 삭제(is_deleted: true)를 수행해야 함", async () => {
    const initialTodo = {
      id: "1",
      content: "Test",
      is_completed: false,
      created_at: "2024-01-01",
      category_id: null,
      due_date: null,
      is_recurring: false,
      recurring_day: null,
      user_id: "user123",
      is_deleted: false,
    };
    useTodoStore.setState({ todos: [initialTodo] });

    (supabase.from as any).mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    await useTodoStore.getState().deleteTodo("1");
    expect(useTodoStore.getState().todos[0].is_deleted).toBe(true);
  });
});
