"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageSquare,
  Upload,
  Activity,
  Menu,
  X,
  Brain,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/agents", label: "Agents", icon: Brain },
  { href: "/dashboard", label: "Dashboard", icon: Activity },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (pathname === "/chat") return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ——— Logo ——— */}
          <Link href="/" className="group flex items-center gap-2.5">
            {/* Neural‑network SVG */}
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="shrink-0"
            >
              {/* Connections */}
              <line
                x1="8"
                y1="8"
                x2="24"
                y2="8"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <line
                x1="8"
                y1="8"
                x2="16"
                y2="24"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <line
                x1="24"
                y1="8"
                x2="16"
                y2="24"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <line
                x1="8"
                y1="8"
                x2="8"
                y2="24"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              <line
                x1="24"
                y1="8"
                x2="24"
                y2="24"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              <line
                x1="8"
                y1="24"
                x2="24"
                y2="24"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <line
                x1="8"
                y1="24"
                x2="16"
                y2="16"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              <line
                x1="24"
                y1="24"
                x2="16"
                y2="16"
                stroke="url(#lineGrad)"
                strokeWidth="1"
                strokeOpacity="0.25"
              />

              {/* Nodes */}
              <circle cx="8" cy="8" r="3" fill="#3FC9B5" />
              <circle cx="24" cy="8" r="3" fill="#9D7CFF" />
              <circle cx="16" cy="16" r="2.5" fill="#3FC9B5" opacity="0.7" />
              <circle cx="8" cy="24" r="3" fill="#9D7CFF" />
              <circle cx="24" cy="24" r="3" fill="#3FC9B5" />
              <circle cx="16" cy="24" r="2.5" fill="#9D7CFF" opacity="0.7" />

              {/* Glow on primary nodes */}
              <circle cx="8" cy="8" r="5" fill="#3FC9B5" opacity="0.15" />
              <circle cx="24" cy="8" r="5" fill="#9D7CFF" opacity="0.15" />
              <circle cx="8" cy="24" r="5" fill="#9D7CFF" opacity="0.15" />
              <circle cx="24" cy="24" r="5" fill="#3FC9B5" opacity="0.15" />

              <defs>
                <linearGradient
                  id="lineGrad"
                  x1="0"
                  y1="0"
                  x2="32"
                  y2="32"
                >
                  <stop stopColor="#3FC9B5" />
                  <stop offset="1" stopColor="#9D7CFF" />
                </linearGradient>
              </defs>
            </motion.svg>

            <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-teal-400 via-purple-400 to-violet-500 bg-clip-text text-transparent select-none">
              DualCore
            </span>
          </Link>

          {/* ——— Desktop Links ——— */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;

              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "text-purple-400"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-purple-400" : "text-zinc-500"
                      }`}
                    />
                    {link.label}

                    {/* Active underline glow */}
                    {active && (
                      <motion.span
                        layoutId="navActiveIndicator"
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-violet-500 shadow-[0_0_12px_rgba(157,124,255,0.6)]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* ——— Mobile Hamburger ——— */}
          <motion.button
            className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* ——— Mobile Menu ——— */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-[#0a0a0c]/95 backdrop-blur-2xl border-b border-zinc-800/50"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-purple-400 bg-purple-500/10 shadow-[inset_0_0_0_1px_rgba(157,124,255,0.15)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                      }`}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 ${
                          active ? "text-purple-400" : "text-zinc-500"
                        }`}
                      />
                      {link.label}

                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(157,124,255,0.6)]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
