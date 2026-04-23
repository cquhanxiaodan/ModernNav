import React from "react";
import { ThemeMode } from "../types";

interface GlassCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  opacity?: number;
  themeMode?: ThemeMode;
  href?: string;
  target?: string;
  rel?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hoverEffect = false,
  onClick,
  opacity = 0.1,
  themeMode = ThemeMode.Dark,
  style,
  href,
  target,
  rel,
  ...props
}) => {
  const isDark = themeMode === ThemeMode.Dark;
  const Component = href ? "a" : "div";

  const bgColor = isDark
    ? `rgba(30, 41, 59, ${0.4 + opacity * 0.5})`
    : `rgba(255, 255, 255, ${0.7 + opacity * 0.3})`;

  const borderColor = isDark ? "border-white/[0.06]" : "border-slate-200/80";

  const shadowClass = isDark
    ? "shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.1)]"
    : "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]";

  const containerClasses = `
    relative block overflow-hidden rounded-2xl border
    transition-all duration-300 ease-out
    group no-underline
    ${borderColor}
    ${shadowClass}
    ${
      hoverEffect
        ? `
      hover:scale-[1.02]
      hover:-translate-y-0.5
      hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
      ${isDark ? "hover:border-white/10" : "hover:border-slate-300"}
      cursor-pointer`
        : ""
    }
    ${className}
  `;

  return (
    <Component
      className={containerClasses}
      onClick={onClick}
      href={href}
      target={target}
      rel={rel}
      style={{
        backgroundColor: bgColor,
        ...style,
      }}
      {...(props as any)}
    >
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center ${
          isDark ? "text-white" : "text-slate-800"
        }`}
      >
        {children}
      </div>
    </Component>
  );
};
