import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";
import { Link } from "react-router-dom";

type ModalName = "platform" | "features" | "roadmap" | "contact";

interface NavbarProps {
  onMenuClick: () => void;
  showAuthLinks?: boolean;
}

export const Navbar = ({ onMenuClick, showAuthLinks }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem: React.FC<{ label: string; id: string; name: "platform" | "features" | "roadmap" | "contact" }> = ({ label, id }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        // If already on landing page, smooth-scroll to the section
        if (location.pathname === "/") {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        // Otherwise navigate to landing with hash; Landing will handle scrolling
        navigate(`/#${id}`);
      }}
      // Nav items now scroll to sections on the page
      className="group px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition flex items-center gap-2 relative cursor-pointer"
    >
      {/* Glow background */}
      <motion.span
        layout
        className="absolute inset-0 rounded-md pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.9 }}
        transition={{ duration: 0.24 }}
        style={{ background: "linear-gradient(90deg,#06b6d4, #3b82f6)", filter: "blur(10px)" }}
      />

      <span className="relative z-10">{label}</span>

      {/* Animated underline */}
      <motion.span
        className="absolute left-1 right-1 bottom-0 h-0.5 rounded bg-gradient-to-r from-teal-300 to-sky-400"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.button>
  );

  return (
    <header className="fixed top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 h-14 sm:h-16 rounded-2xl sm:rounded-3xl border border-white/10 bg-background/20 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 lg:px-8 z-50 shadow-lg" style={{ boxShadow: '0 12px 40px rgba(59,130,246,0.12), 0 4px 12px rgba(6,182,212,0.08)' }}>
      {/* Left: mobile menu + brand */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={onMenuClick}>
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
            <BrandLogo />
          </div>
          <div className="text-base sm:text-lg font-semibold tracking-tight text-foreground brand-font truncate">
            TradeOne
          </div>
        </div>
      </div>

      {/* Center: nav links - hidden on mobile */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
        <NavItem label="Platform" id="platform" name="platform" />
        <NavItem label="Features" id="features" name="features" />
        <NavItem label="Roadmap" id="roadmap" name="roadmap" />
        <NavItem label="Contact" id="contact" name="contact" />
      </nav>

      {/* Right: notifications + avatar OR auth links on landing */}
      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
        {showAuthLinks ? (
          <>
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-xs sm:text-sm h-8 sm:h-10">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-10">
                Start Free
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="relative flex-shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                JD
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>

      {/* Modals are controlled at layout level */}
    </header>
  );
};