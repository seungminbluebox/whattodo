"use client";
import React from "react";
import { Plus, ChevronLeft, ChevronRight, FolderPlus } from "lucide-react";
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
            <div className="flex flex-col border border-border bg-foreground/5 rounded-2xl p-4 focus-within:border-foreground/40 focus-within:bg-foreground/10 transition-all">
              <div className="flex items-center justify-between gap-4">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[15px] focus:ring-0 placeholder:text-foreground/40 text-foreground font-light p-0 transition-all"
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
                      className="text-foreground hover:text-foreground/80 transition-colors shrink-0"
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
                      className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${useDeadline ? "text-foreground" : "text-foreground/40 hover:text-foreground/60"}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${useDeadline ? "bg-foreground" : "bg-transparent border border-foreground/40"}`}
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
                                className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-60 transition-opacity"
                              >
                                {monthName} {daysInMonth.year}
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
                              className="w-full py-3.5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all bg-foreground text-black mb-2"
                            >
                              Select Date
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUseDeadline(false);
                                setShowDatePicker(false);
                              }}
                              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground/60 transition-colors"
                            >
                              Set as Someday
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {useDeadline && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${isRecurring ? "text-foreground" : "text-foreground/40 hover:text-foreground/60"}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${isRecurring ? "bg-foreground" : "bg-transparent border border-foreground/40"}`}
                      ></div>
                      {isRecurring ? "monthly" : "one-time"}
                    </button>
                  </div>
                )}
                {!activeCategory && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCatMenu(!showCatMenu)}
                      className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${selectedCatId ? "text-foreground" : "text-foreground/40 hover:text-foreground/60"}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${selectedCatId ? "bg-foreground" : "bg-transparent border border-foreground/40"}`}
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
                        <div className="absolute bottom-full mb-4 left-0 w-48 bg-background border border-border rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-[51]">
                          <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCatId(null);
                                setShowCatMenu(false);
                              }}
                              className="w-full text-left p-2 text-[11px] text-foreground/40 hover:text-foreground transition-all lowercase"
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
                                className={`w-full text-left p-2 text-[11px] transition-all lowercase ${selectedCatId === cat.id ? "text-foreground font-bold" : "text-foreground/60 hover:text-foreground"}`}
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
                    placeholder="create new category..."
                    className="bg-transparent border-none p-0 text-[13px] font-medium tracking-tight text-foreground/50 focus:ring-0 placeholder:text-foreground/40 lowercase flex-1 min-w-0"
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
