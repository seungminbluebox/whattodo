"use client";

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 text-center font-sans selection:bg-blue-500/30">
      <h1 className="text-[40px] font-bold mb-12 tracking-[-0.05em] text-foreground">
        whattodo
      </h1>
      <button
        onClick={onLogin}
        className="border border-border px-10 py-5 hover:bg-foreground hover:text-background transition-all flex items-center gap-3 font-bold tracking-tight text-[14px] uppercase tracking-[0.1em] rounded-full"
      >
        Continue with Google
      </button>
    </main>
  );
}
