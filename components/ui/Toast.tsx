"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  show: boolean;
  message: string;
}

export default function Toast({ show, message }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
        >
          <p className="text-[12px] text-white/90 font-medium tracking-tight whitespace-nowrap">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
