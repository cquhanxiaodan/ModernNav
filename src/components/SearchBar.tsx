import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { SearchEngine, ThemeMode } from "../types";
import { SEARCH_ENGINES } from "../constants";
import { useLanguage } from "../contexts/LanguageContext";
import { getFaviconUrl } from "../utils/favicon";
import { SmartIcon } from "./SmartIcon";

interface SearchBarProps {
  themeMode: ThemeMode;
  faviconApi?: string;
  viewportScale?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  themeMode,
  faviconApi,
  viewportScale = 1,
}) => {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredEngine, setHoveredEngine] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  const isDark = themeMode === ThemeMode.Dark;

  const stateClasses = isDark
    ? "bg-slate-800/60 hover:bg-slate-800/80 focus-within:bg-slate-800/90 border-slate-700/50 hover:border-slate-600 focus-within:border-[var(--theme-primary)]/40"
    : "bg-white/80 hover:bg-white focus-within:bg-white border-slate-200/80 hover:border-slate-300 focus-within:border-[var(--theme-primary)]/60";

  const shadowClasses = isDark
    ? "shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--theme-primary),transparent_85%)]"
    : "shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--theme-primary),transparent_85%)]";

  const textColor = isDark ? "text-white" : "text-slate-800";
  const placeholderColor = isDark
    ? "placeholder-white/20 focus-within:placeholder-white/40"
    : "placeholder-slate-400 focus-within:placeholder-slate-500";
  const iconColor = isDark
    ? "text-white/30 group-hover:text-white/70"
    : "text-slate-400 group-hover:text-slate-600";
  const dividerColor = isDark
    ? "border-r border-slate-700 group-hover:border-slate-600"
    : "border-r border-slate-200 group-hover:border-slate-300";

  const dropdownClasses = isDark ? "dropdown-dark" : "dropdown-light";
  const dropdownText = isDark ? "text-white" : "text-slate-800";

  const itemBase =
    "flex-shrink-0 flex items-center gap-2 px-2.5 h-6 rounded-md text-[11px] whitespace-nowrap";
  const itemHover = isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900";
  const itemActive = "bg-[var(--theme-primary)] text-white font-medium shadow-sm";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(`${selectedEngine.urlTemplate}${encodeURIComponent(query)}`, "_blank");
    setQuery("");
  };

  const handleEngineSelect = (engine: SearchEngine) => {
    setSelectedEngine(engine);
    setIsDropdownOpen(false);
  };

  const scaledHeight = Math.round(48 * viewportScale);
  const scaledIconSize = Math.round(20 * viewportScale);
  const scaledChevronSize = Math.round(14 * viewportScale);
  const scaledSearchIconSize = Math.round(18 * viewportScale);
  const scaledFontSize = Math.max(14, Math.round(14 * viewportScale));

  return (
    <div className="w-full max-w-[30rem] mx-auto relative z-[70] transition-all duration-300">
      <form onSubmit={handleSearch} className="relative w-full group" ref={dropdownRef}>
        <div
          className={`relative flex items-center rounded-2xl transition-all duration-300 border ${stateClasses} ${shadowClasses}`}
          style={{
            height: `${scaledHeight}px`,
          }}
        >
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`h-full flex items-center gap-2 pl-4 pr-3 rounded-l-2xl transition-colors min-w-[70px] ${dividerColor} ${
                isDark
                  ? "text-white/50 hover:text-white hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span
                className="flex items-center justify-center rounded-md overflow-hidden transition-opacity"
                style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px` }}
              >
                <SmartIcon
                  icon={getFaviconUrl(selectedEngine.icon, faviconApi)}
                  size={scaledIconSize}
                  imgClassName="object-contain"
                  style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px` }}
                  faviconApi={faviconApi}
                />
              </span>
              <ChevronDown
                size={scaledChevronSize}
                className={`transition-transform duration-200 opacity-40 group-hover:opacity-80 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <input
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder", {
              engine: selectedEngine.name,
            })}
            style={{ fontSize: `${scaledFontSize}px` }}
            className={`flex-1 bg-transparent border-none outline-none px-4 h-full text-left transition-colors ${textColor} ${placeholderColor}`}
          />

          <button
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            type="submit"
            className={`p-2.5 mr-1 transition-all rounded-xl ${iconColor} ${
              isDark
                ? "hover:bg-white/10 hover:text-white"
                : "hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Search size={scaledSearchIconSize} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[80]">
            <div className={`px-1 ${dropdownClasses} rounded-xl overflow-hidden`}>
              <div className="h-10 flex flex-row overflow-x-auto no-scrollbar gap-1.5 px-1 items-center">
                {SEARCH_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => handleEngineSelect(engine)}
                    onMouseEnter={() => setHoveredEngine(engine.id)}
                    onMouseLeave={() => setHoveredEngine(null)}
                    style={{
                      height: `${Math.round(24 * viewportScale)}px`,
                      fontSize: `${Math.max(11, Math.round(11 * viewportScale))}px`,
                    }}
                    className={`${itemBase} ${dropdownText} ${
                      selectedEngine.id === engine.id
                        ? itemActive
                        : hoveredEngine === engine.id
                          ? itemHover
                          : "opacity-80"
                    }`}
                  >
                    <span
                      className="flex items-center justify-center rounded-sm overflow-hidden"
                      style={{
                        width: `${Math.round(14 * viewportScale)}px`,
                        height: `${Math.round(14 * viewportScale)}px`,
                      }}
                    >
                      <SmartIcon
                        icon={getFaviconUrl(engine.icon, faviconApi)}
                        size={Math.round(14 * viewportScale)}
                        imgClassName="object-contain"
                        faviconApi={faviconApi}
                      />
                    </span>
                    <span className="font-medium tracking-tight">{engine.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
