"use client";
import { motion } from "framer-motion";
import { Category } from "@/store/useTodoStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { subscribeToPush, registerServiceWorker } from "@/lib/pushNotification";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  view: "category" | "calendar" | "trash";
  setView: (view: "category" | "calendar" | "trash") => void;
  activeCategory: Category | null;
  setActiveCategory: (cat: Category | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  setEditingCatId: (id: string | null) => void;
}

export default function Header({
  view,
  setView,
  activeCategory,
  setActiveCategory,
  isEditing,
  setIsEditing,
  setEditingCatId,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center pt-4 pb-12 border-b border-border w-full gap-4">
      <div className="flex gap-5 sm:gap-6">
        <button
          onClick={() => {
            setView("category");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "category"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          category
          {view === "category" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("calendar");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "calendar"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          calendar
          {view === "calendar" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => {
            setView("trash");
            setActiveCategory(null);
            setIsEditing(false);
          }}
          className={`text-sm font-semibold tracking-tight transition-all relative py-1 ${
            view === "trash"
              ? "text-foreground"
              : "text-muted hover:text-foreground/70"
          }`}
        >
          trash
          {view === "trash" && (
            <motion.div
              layoutId="header-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {view === "category" && !activeCategory && (
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setEditingCatId(null);
            }}
            className="text-[13px] font-medium tracking-tight text-muted hover:text-foreground transition-colors lowercase shrink-0 mr-1 px-2 py-1 rounded-md hover:bg-accent"
          >
            {isEditing ? "done" : "edit"}
          </button>
        )}
        <button
          onClick={async (e) => {
            const btn = e.currentTarget;
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";

            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (user) {
                console.log("Starting push registration for user:", user.id);
                const reg = await registerServiceWorker();
                if (reg) {
                  await subscribeToPush(user.id);
                } else {
                  alert(
                    "서비스 워커를 등록할 수 없습니다. (HTTPS 환경인지 확인하세요)",
                  );
                }
              } else {
                alert("먼저 로그인해 주세요.");
              }
            } catch (err) {
              console.error("Button click error:", err);
              alert("에러: " + err);
            } finally {
              btn.style.opacity = "1";
              btn.style.pointerEvents = "auto";
            }
          }}
          className="p-1.5 text-muted hover:text-foreground transition-all rounded-md hover:bg-accent/50 mr-1"
          aria-label="Toggle notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
