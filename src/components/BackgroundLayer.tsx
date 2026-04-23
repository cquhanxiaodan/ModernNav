import React from "react";

interface BackgroundLayerProps {
  background: string;
  isDark: boolean;
  pageBgColor?: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ background, isDark, pageBgColor }) => {
  const isBackgroundUrl = background.startsWith("http") || background.startsWith("data:");

  if (isBackgroundUrl) {
    return (
      <div className="fixed inset-0 z-0">
        <img
          src={background}
          alt="Background"
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: isDark ? 0.3 : 0.15 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0";
          }}
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isDark ? "bg-slate-900/70" : "bg-white/85"
          }`}
          style={!isDark && pageBgColor ? { backgroundColor: pageBgColor } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <div
        className="w-full h-full transition-opacity duration-700"
        style={{
          background: background,
          opacity: isDark ? 0.4 : 0.15,
        }}
      />
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? "bg-slate-900/60" : "bg-slate-50/90"
        }`}
        style={!isDark && pageBgColor ? { backgroundColor: pageBgColor } : undefined}
      />
    </div>
  );
};
