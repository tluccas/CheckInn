import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Hotel,
  Menu,
  X,
  LogOut,
  CalendarCheck,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/store/auth.context";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hotels", label: "Hotéis", icon: Hotel },
  { to: "/reservations", label: "Reservas", icon: CalendarCheck },
  { to: "/guests", label: "Hóspedes", icon: Users },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Animação de scroll apenas na home page
  const isHomePage = location.pathname === "/";

useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => window.removeEventListener("scroll", onScroll);
}, [isHomePage]);


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.header
      initial={false}
      animate={{
        maxWidth: isHomePage && scrolled ? "64rem" : "100%",
        borderRadius: isHomePage && scrolled ? "9999px" : "0px",
        margin: isHomePage && scrolled ? "12px auto" : "0px",
        boxShadow: isHomePage && scrolled
          ? "0 4px 24px rgba(68, 116, 157, 0.15)"
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="fixed top-0 left-0 right-0 z-30 bg-white/75 backdrop-blur-md border-b border-[var(--color-secondary)]/40"
    >
      <div className="mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Hotel size={20} className="text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Check<span className="text-[var(--color-accent)]">Inn</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-[var(--color-text-light)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                    }
                  `}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[var(--color-text-light)] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-md"
            >
              Entrar
            </Link>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-light)] hover:bg-[var(--color-surface)] cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {isAuthenticated && mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-[var(--color-secondary)]/40 px-4 py-3 space-y-1"
        >
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-light)] hover:bg-[var(--color-surface)]"
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </motion.nav>
      )}
    </motion.header>
  );
}
