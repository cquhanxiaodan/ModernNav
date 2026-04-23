import React, { useState } from "react";
import { Sliders, RotateCcw, Save, Wand2, Loader2, Image as ImageIcon, Palette } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { DEFAULT_BACKGROUND } from "../../services/storage";
import { DEFAULT_LAYOUT_UI, DEFAULT_PAGE_BG_COLOR } from "../../constants/defaults";
import { getDominantColor } from "../../utils/color";
import { useViewportScale } from "../../hooks/useViewportScale";
import { getIconSize } from "../../utils/favicon";

interface AppearanceTabProps {
  currentBackground: string;
  currentOpacity: number;
  currentThemeColor: string;
  currentThemeAuto: boolean;
  onUpdate: (
    url: string,
    opacity: number,
    color?: string,
    layoutPrefs?: { width: number; cardWidth: number; cardHeight: number; cols: number },
    themeAuto?: boolean
  ) => void;
  currentLayout: { width: number; cardWidth: number; cardHeight: number; cols: number };
  currentPageBgColor?: string;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  currentBackground,
  currentOpacity,
  currentThemeColor,
  currentThemeAuto,
  onUpdate,
  currentLayout = DEFAULT_LAYOUT_UI,
  currentPageBgColor,
}) => {
  const { t } = useLanguage();
  const viewportScale = useViewportScale();
  const s = (n) => getIconSize(n, viewportScale);

  // Local state for inputs (UI Preview)
  const [bgInput, setBgInput] = useState(currentBackground);
  const [opacityInput, setOpacityInput] = useState(currentOpacity);
  const [themeColorInput, setThemeColorInput] = useState(currentThemeColor);
  const [localAutoMode, setLocalAutoMode] = useState(currentThemeAuto);

  // Layout states
  const [widthInput, setWidthInput] = useState(currentLayout.width);
  const [cardWidthInput, setCardWidthInput] = useState(currentLayout.cardWidth);
  const [cardHeightInput, setCardHeightInput] = useState(currentLayout.cardHeight);
  const [colsInput, setColsInput] = useState(currentLayout.cols);

  const [pageBgColorInput, setPageBgColorInput] = useState(
    currentPageBgColor ?? DEFAULT_PAGE_BG_COLOR
  );

  // Status and Loading states
  const [bgStatus, setBgStatus] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleResetBackground = () => {
    setBgInput(DEFAULT_BACKGROUND);
    setBgStatus(t("bg_updated"));
    setTimeout(() => setBgStatus(""), 3000);
  };

  // This is the ONLY place where global state updates and API calls happen
  const handleUpdateSettings = () => {
    // Unified update call: Background + Opacity + Theme + Layout
    onUpdate(
      bgInput,
      opacityInput,
      themeColorInput,
      {
        width: widthInput,
        cardWidth: cardWidthInput,
        cardHeight: cardHeightInput,
        cols: colsInput,
      },
      localAutoMode,
      { pageBgColor: pageBgColorInput }
    );

    setBgStatus(t("bg_updated"));
    setTimeout(() => setBgStatus(""), 3000);
  };

  // Purely local state update for smooth 60fps dragging
  const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setThemeColorInput(color);
    setLocalAutoMode(false);
  };

  const handleAutoExtract = async () => {
    if (!bgInput) return;
    setIsExtracting(true);
    setBgStatus(t("extracting_color"));
    try {
      const color = await getDominantColor(bgInput);
      setThemeColorInput(color);
      setLocalAutoMode(true);
      setBgStatus(t("theme_updated"));
    } catch (e) {
      setBgStatus("Extraction failed");
    } finally {
      setIsExtracting(false);
      setTimeout(() => setBgStatus(""), 3000);
    }
  };

  // Dynamic Styles: Overrides global CSS variables strictly within this tab
  // This enables real-time preview of buttons/accents without re-rendering the whole app
  const previewStyles: Record<string, string | number> = {
    "--theme-primary": themeColorInput,
    "--theme-hover": `color-mix(in srgb, ${themeColorInput}, black 10%)`,
    "--theme-active": `color-mix(in srgb, ${themeColorInput}, black 20%)`,
    "--theme-light": `color-mix(in srgb, ${themeColorInput}, white 30%)`,
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto h-full overflow-y-auto animate-fade-in custom-scrollbar"
      style={previewStyles}
    >
      <div className="space-y-3 pb-4 relative">
        {/* SECTION 1: IMMERSIVE VISUAL CONSOLE (Background + Theme + Full-Width Preview) */}
        <section className="relative group overflow-hidden bg-slate-100 rounded-3xl border border-slate-200 shadow-sm">
          {/* Full-width Background Preview Layer */}
          <div className="h-48 relative overflow-hidden">
            {bgInput.startsWith("http") || bgInput.startsWith("data:") ? (
              <img
                src={bgInput}
                alt="Background Context"
                className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-700"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className="w-full h-full opacity-50" style={{ background: bgInput }} />
            )}

            {/* Centered Floating Preview Card */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl transition-all duration-300 flex items-center justify-center"
                style={{
                  width: `${(cardWidthInput / 100) * 110}px`,
                  height: `${(cardHeightInput / 100) * 80}px`,
                  background: `linear-gradient(135deg, rgba(255, 255, 255, ${opacityInput}), rgba(255, 255, 255, ${opacityInput * 0.4}))`,
                }}
              ></div>
            </div>
          </div>

          {/* Controls Overlay on Visual Core */}
          <div className="p-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-xs pl-1">{t("bg_url_label")}</label>
                <div className="relative group/input text-sm">
                  <ImageIcon
                    size={s(16)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={bgInput}
                    onChange={(e) => setBgInput(e.target.value)}
                    placeholder={t("bg_url_placeholder")}
                    className="input-primary pl-10 pr-4 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-xs pl-1">{t("label_theme_color")}</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="color"
                        value={themeColorInput}
                        onChange={handleColorPick}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent p-0 border-0 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex-1 text-right pr-1">
                        {themeColorInput}
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={handleAutoExtract}
                    disabled={isExtracting}
                    className="btn-secondary h-9 px-4 rounded-xl disabled:opacity-50"
                    title={t("btn_auto_extract")}
                  >
                    {isExtracting ? (
                      <Loader2 size={s(16)} className="animate-spin" />
                    ) : (
                      <Wand2
                        size={s(16)}
                        className="group-hover:text-[var(--theme-primary)] transition-colors"
                      />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                      {t("btn_auto_extract")}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-xs pl-1">{t("label_page_bg_color")}</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="color"
                        value={pageBgColorInput}
                        onChange={(e) => setPageBgColorInput(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent p-0 border-0 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex-1 text-right pr-1">
                        {pageBgColorInput}
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={() => setPageBgColorInput(DEFAULT_PAGE_BG_COLOR)}
                    className="btn-secondary h-9 px-4 rounded-xl"
                    title={t("reset_bg_btn")}
                  >
                    <RotateCcw size={s(16)} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CONSOLIDATED PRECISION ENGINE (Layout + Geometry) */}
        <section className="bg-white p-4 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <Sliders size={s(18)} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  {t("precision_controls")}
                </h3>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                  {t("geometry_layout")}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)]"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            {/* Canvas Width */}
            <div className="group">
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {t("canvas_width")}
                </label>
                <span className="text-[10px] text-[var(--theme-primary)] font-mono font-bold bg-[var(--theme-primary)]/10 px-1.5 py-0.5 rounded leading-none">
                  {widthInput}px
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="1440"
                step="20"
                value={widthInput}
                onChange={(e) => setWidthInput(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>

            {/* Grid Logic */}
            <div className="group">
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {t("grid_cols")}
                </label>
                <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                  {colsInput}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={colsInput}
                onChange={(e) => setColsInput(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>

            {/* Card Width */}
            <div className="group">
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {t("card_width")}
                </label>
                <span className="text-[10px] text-[var(--theme-primary)] font-mono font-bold">
                  {cardWidthInput}px
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                step="4"
                value={cardWidthInput}
                onChange={(e) => setCardWidthInput(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>

            {/* Card Height */}
            <div className="group">
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {t("card_height")}
                </label>
                <span className="text-[10px] text-[var(--theme-primary)] font-mono font-bold">
                  {cardHeightInput}px
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                step="4"
                value={cardHeightInput}
                onChange={(e) => setCardHeightInput(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>

            {/* Card Opacity - Single row on desktop for prominence */}
            <div className="group md:col-span-2 space-y-2.5">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                  {t("surface_opacity")}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--theme-primary)] transition-all duration-300"
                      style={{ width: `${opacityInput * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono font-bold min-w-[32px] text-right">
                    {Math.round(opacityInput * 100)}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.85"
                step="0.05"
                value={opacityInput}
                onChange={(e) => setOpacityInput(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>
          </div>
        </section>

        {/* COMPACT ACTION BAR */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleResetBackground}
            className="btn-secondary flex-1 py-2.5 rounded-2xl tracking-[0.15em] font-bold uppercase group"
          >
            <RotateCcw size={s(14)} className="group-active:rotate-[-90deg] transition-transform" />
            <span className="text-[10px]">{t("reset_bg_btn")}</span>
          </button>
          <button
            onClick={handleUpdateSettings}
            className="btn-primary flex-1 py-2.5 rounded-2xl tracking-[0.2em] text-[11px]"
          >
            <Save size={s(14)} />
            <span>{t("update_bg_btn")}</span>
          </button>
        </div>

        {/* MINIMAL SUCCESS TEXT */}
        {bgStatus && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 animate-fade-in-up drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] pointer-events-none">
            {bgStatus}
          </div>
        )}
      </div>
    </div>
  );
};
