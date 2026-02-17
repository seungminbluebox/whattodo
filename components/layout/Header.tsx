"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/store/useTodoStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  subscribeToPush,
  registerServiceWorker,
  unsubscribeFromPush,
  checkPushSubscription,
} from "@/lib/pushNotification";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkSub() {
      const subbed = await checkPushSubscription();
      setIsSubscribed(subbed);
    }
    checkSub();
  }, []);

  const handlePushToggle = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("먼저 로그인해 주세요.");
        return;
      }

      if (isSubscribed) {
        // 알림 해제
        const success = await unsubscribeFromPush(user.id);
        if (success) {
          setIsSubscribed(false);
          alert("알림이 해제되었습니다. 🔕");
        }
      } else {
        // 알림 신청
        const reg = await registerServiceWorker();
        if (reg) {
          const sub = await subscribeToPush(user.id, true);
          if (sub) {
            setIsSubscribed(true);
          }
        } else {
          alert("서비스 워커를 지원하지 않는 브라우저입니다.");
        }
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          onClick={handlePushToggle}
          disabled={isLoading}
          className={`p-1.5 transition-all rounded-md hover:bg-accent/50 mr-1 relative flex items-center justify-center ${
            isSubscribed
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          }`}
          aria-label="Toggle notifications"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
              >
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </motion.div>
            ) : isSubscribed ? (
              <motion.div
                key="bell-on"
                initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <motion.div
                  layoutId="push-dot"
                  className="absolute top-1.5 right-1.5 w-1 h-1 bg-red-500 rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="bell-off"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
