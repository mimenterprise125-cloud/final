import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
  isActive?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, path, isActive, onClick, collapsed = false }) => {
  return (
    <Link to={path} onClick={onClick} aria-current={isActive ? "page" : undefined}>
      <div
        role="menuitem"
        tabIndex={0}
        title={collapsed ? label : undefined}
        className={cn(
          "w-full flex items-center gap-0 px-3 py-3.5 rounded-xl transition-all duration-200 sidebar-item group relative overflow-hidden",
          isActive 
            ? "bg-gradient-to-r from-primary/25 to-primary/10 text-primary shadow-md border border-primary/30" 
            : "hover:bg-accent/10 border border-transparent hover:border-accent/20"
        )}
        onKeyDown={(e) => {
          // support Enter/Space activation for accessibility
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const target = e.currentTarget as HTMLDivElement;
            target.click();
          }
        }}
      >
        {/* Active indicator line */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-lg" />
        )}

        <div className="w-14 flex-shrink-0 flex items-center justify-center">
          <Icon className={cn(
            "w-5 h-5 transition-all duration-200",
            isActive 
              ? "text-primary scale-110" 
              : "text-muted-foreground group-hover:text-accent group-hover:scale-105"
          )} />
        </div>

        <span className={cn(
          "flex-1 text-left font-medium text-sm transition-all duration-200",
          isActive ? "text-primary" : "text-foreground group-hover:text-foreground"
        )}>
          {label}
        </span>

        {isActive && (
          <div className="w-2 h-2 rounded-full bg-primary mr-3 animate-pulse" />
        )}
      </div>
    </Link>
  );
};

export default SidebarItem;
