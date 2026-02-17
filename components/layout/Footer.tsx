"use client";
import React from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Calendar,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/store/useTodoStore";
import { supabase } from "@/lib/supabase";

interface FooterProps {
  view: "category" | "calendar" | "trash";
  inputValue: string;
  setInputValue: (v: string) => void;
  handleAddTodo: (e: React.FormEvent) => void;
  monthName: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  useDeadline: boolean;
  setUseDeadline: (use: boolean) => void;
  daysInMonth: {
    firstDay: number;
    lastDate: number;
    year: number;
    month: number;
  };
  changeMonth: (offset: number) => void;
  direction: number;
  activeCategory: Category | null;
  showCatMenu: boolean;
  setShowCatMenu: (show: boolean) => void;
  selectedCatId: string | null;
  setSelectedCatId: (id: string | null) => void;
  categories: Category[];
  newCatName: string;
  setNewCatName: (name: string) => void;
  handleAddCategory: (e: React.FormEvent) => void;
  isRecurring: boolean;
  setIsRecurring: (is: boolean) => void;
}

export default function Footer({
  view,
  inputValue,
  setInputValue,
  handleAddTodo,
  monthName,
  selectedDate,
  setSelectedDate,
  showDatePicker,
  setShowDatePicker,
  useDeadline,
  setUseDeadline,
  daysInMonth,
  changeMonth,
  direction,
  activeCategory,
  showCatMenu,
  setShowCatMenu,
  selectedCatId,
  setSelectedCatId,
  categories,
  newCatName,
  setNewCatName,
  handleAddCategory,
  isRecurring,
  setIsRecurring,
}: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-8 pb-4 pt-0 bg-background z-50">
      <div className="space-y-6">
        {view !== "trash" && (
          <form onSubmit={handleAddTodo} className="space-y-6">
            <div className="flex flex-col border-2 border-border bg-card rounded-2xl p-5 focus-within:border-foreground/20 focus-within:shadow-lg transition-all shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[16px] focus:ring-0 placeholder:text-muted/60 text-foreground font-medium p-0 transition-all"
                  placeholder={
                    view === "calendar"
                      ? `Task for ${monthName.slice(0, 3)} ${new Date(selectedDate).getDate()}...`
                      : "Add a task..."
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
                      className="text-background bg-foreground px-3 py-1.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all"
                    >
                      ADD
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar flex-nowrap min-h-8">
                {view !== "calendar" && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                        useDeadline
                          ? "bg-accent text-foreground border-accent"
                          : "bg-foreground/5 text-foreground/40 border-transparent hover:border-border hover:bg-foreground/10"
                      }`}
                    >
                      <Calendar size={11} strokeWidth={2.5} />
                      {useDeadline
                        ? `${new Date(selectedDate).getMonth() + 1}월 ${new Date(selectedDate).getDate()}일`
                        : "날짜 선택"}
                    </button>
                    {showDatePicker && (
                      <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm cursor-pointer"
                        onClick={() => {
                          setUseDeadline(false);
                          setShowDatePicker(false);
                        }}
                      >
                        <div
                          className="relative w-[340px] h-[500px] bg-background border border-border border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 cursor-default"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-6 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeMonth(-1);
                              }}
                              className="text-foreground/40 hover:text-foreground p-2 w-10 h-10 flex items-center justify-center transition-all bg-foreground/5 rounded-full"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <div className="flex-1 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedDate(
                                    new Date().toISOString().split("T")[0],
                                  )
                                }
                                className="text-[14px] font-bold tracking-[0.1em] text-foreground hover:opacity-60 transition-opacity"
                              >
                                {daysInMonth.year}년 {daysInMonth.month + 1}월
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeMonth(1);
                              }}
                              className="text-foreground/40 hover:text-foreground p-2 w-10 h-10 flex items-center justify-center transition-all bg-foreground/5 rounded-full"
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
                                        className="h-8 flex items-center justify-center text-[9px] font-bold text-foreground/40 uppercase tracking-widest"
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
                                        className={`h-9 text-[13px] rounded-xl transition-all flex items-center justify-center ${isSel ? "bg-foreground text-background font-bold scale-105" : "text-foreground/60 hover:bg-foreground/10 hover:text-foreground"}`}
                                      >
                                        {day}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          <div className="mt-4 pt-6 border-t border-border shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setUseDeadline(true);
                                setShowDatePicker(false);
                              }}
                              className="w-full py-3.5 text-sm font-bold rounded-2xl transition-all bg-foreground text-background mb-2"
                            >
                              날짜 선택 완료
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUseDeadline(false);
                                setShowDatePicker(false);
                              }}
                              className="w-full py-3 text-xs font-bold text-foreground/40 hover:text-foreground transition-colors"
                            >
                              날짜 없이 추가 (언젠가)
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {useDeadline && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                        isRecurring
                          ? "bg-foreground text-background border-foreground"
                          : "bg-foreground/5 text-foreground/40 border-transparent hover:border-border hover:bg-foreground/10"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${isRecurring ? "bg-background" : "bg-foreground/20"}`}
                      ></div>
                      {isRecurring ? "매달 반복" : "일회성"}
                    </button>
                  </div>
                )}
                {!activeCategory && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCatMenu(!showCatMenu)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.05em] transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                        selectedCatId
                          ? "bg-accent text-foreground border-accent"
                          : "bg-foreground/5 text-foreground/40 border-transparent hover:border-border hover:bg-foreground/10"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${selectedCatId ? "bg-foreground" : "bg-foreground/20"}`}
                      ></div>
                      {selectedCatId
                        ? categories.find((c) => c.id === selectedCatId)?.name
                        : "카테고리 선택"}
                    </button>
                    {showCatMenu && (
                      <div
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm cursor-pointer"
                        onClick={() => setShowCatMenu(false)}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="relative w-[300px] bg-background border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-6 cursor-default"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-[14px] font-bold tracking-[0.1em] text-foreground uppercase">
                              카테고리 선택
                            </h3>
                            <button
                              type="button"
                              onClick={() => setShowCatMenu(false)}
                              className="text-foreground/40 hover:text-foreground transition-colors"
                            >
                              <Plus
                                className="rotate-45"
                                size={20}
                                strokeWidth={2}
                              />
                            </button>
                          </div>

                          <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCatId(null);
                                setShowCatMenu(false);
                              }}
                              className={`w-full text-left p-4 rounded-2xl text-[13px] transition-all flex items-center justify-between border ${
                                !selectedCatId
                                  ? "bg-foreground text-background font-bold border-foreground"
                                  : "bg-foreground/5 text-foreground/60 border-transparent hover:bg-foreground/10"
                              }`}
                            >
                              <span>카테고리 없음</span>
                              {!selectedCatId && (
                                <div className="w-1.5 h-1.5 rounded-full bg-background" />
                              )}
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCatId(cat.id);
                                  setShowCatMenu(false);
                                }}
                                className={`w-full text-left p-4 rounded-2xl text-[13px] transition-all flex items-center justify-between border ${
                                  selectedCatId === cat.id
                                    ? "bg-foreground text-background font-bold border-foreground"
                                    : "bg-foreground/5 text-foreground/60 border-transparent hover:bg-foreground/10"
                                }`}
                              >
                                <span className="lowercase">{cat.name}</span>
                                {selectedCatId === cat.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-background" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {view === "category" && !activeCategory && (
              <div className="mt-2 px-1">
                <div className="flex items-center gap-3 border border-border bg-foreground/5 rounded-xl px-4 py-3 focus-within:border-foreground/40 focus-within:bg-foreground/10 transition-all group">
                  <FolderPlus
                    size={14}
                    className="text-foreground/40 group-focus-within:text-foreground transition-colors"
                  />
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory(e);
                      }
                    }}
                    placeholder="새 카테고리 이름..."
                    className="bg-transparent border-none p-0 text-[13px] font-medium tracking-tight text-foreground/50 focus:ring-0 placeholder:text-foreground/40 flex-1 min-w-0"
                  />
                  <AnimatePresence>
                    {newCatName.trim() && (
                      <motion.button
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-foreground/20 hover:bg-foreground text-foreground hover:text-black p-1.5 rounded-lg transition-all shrink-0"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </form>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] font-bold text-foreground/20 hover:text-red-500/50 transition-colors uppercase tracking-[0.3em] py-2 px-4"
          >
            sign out
          </button>
        </div>
      </div>
    </footer>
  );
}
