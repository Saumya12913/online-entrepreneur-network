import { useState } from "react";
import { Palette, Check } from "./icons";
import { THEMES, applyTheme, storedTheme, DEFAULT_THEME } from "./themes";

// A self-contained preference control: it owns its own state and writes the
// theme straight onto the document, so it can be dropped next to the language
// switcher on the signed-in header and on the sign-in / sign-up cards without
// any of the app's existing state being involved.
export function ThemePicker() {
  const [theme, setTheme] = useState(() => storedTheme());
  const [open, setOpen] = useState(false);

  function choose(id) {
    setTheme(applyTheme(id));
    setOpen(false);
  }

  const current = THEMES.find(t => t.id === theme) || THEMES[0];
  const light = THEMES.filter(t => !t.dark);
  const dark = THEMES.filter(t => t.dark);

  const group = (label, list) => <>
      <p className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="grid grid-cols-2 gap-1">
        {list.map(t => <button key={t.id} onClick={() => choose(t.id)} aria-pressed={t.id === theme} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${t.id === theme ? "bg-blue-50" : "hover:bg-slate-50"}`}>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-200 flex-shrink-0" style={{
            background: t.swatch
          }} />
              <span className={`text-[11px] font-semibold truncate ${t.id === theme ? "text-blue-700" : "text-slate-600"}`}>{t.label}</span>
              {t.id === theme && <Check className="w-3 h-3 text-blue-700 ml-auto flex-shrink-0" />}
            </button>)}
      </div>
    </>;

  return <div className="relative flex items-center">
      <button onClick={() => setOpen(o => !o)} data-vl-i18n="off" title="Theme" aria-label="Theme" aria-haspopup="true" aria-expanded={open} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
        <Palette className="w-5 h-5" />
      </button>
      {open && <>
        {/* Click-away layer: keeps the rest of the header interactive as before. */}
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-30 p-2 overflow-hidden">
          <div className="flex items-center justify-between px-2 pb-1.5 mb-1 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">Choose your theme</p>
            <button onClick={() => choose(DEFAULT_THEME)} className="text-[10px] font-bold text-blue-700 hover:text-blue-800">Reset</button>
          </div>
          {group("Light", light)}
          {group("Dark", dark)}
          <p className="px-2 pt-2 pb-1 text-[10px] text-slate-400">Saved on this device <span className="font-semibold">{current.label}</span></p>
        </div>
      </>}
    </div>;
}
