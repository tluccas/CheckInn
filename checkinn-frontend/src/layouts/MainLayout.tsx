import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header />

      <main className={`flex-1 ${isHomePage ? "pt-24 sm:pt-20" : "pt-20"}`}>
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-secondary)]/40 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} CheckInn
        </div>
      </footer>
    </div>
  );
}
