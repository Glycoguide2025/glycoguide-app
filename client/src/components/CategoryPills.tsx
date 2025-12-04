import React from "react";
import { CAT_ICONS, CAT_EMOJI } from "./icons";

export default function CategoryPills({
  categories,
  activeId,
  onPick,
  large = true,       // 44px+ tap targets
  showIcons = true,   // set false to use emojis
}: {
  categories: { id: string; label: string }[];
  activeId?: string | null;
  onPick: (id: string) => void;
  large?: boolean;
  showIcons?: boolean;
}) {
  const baseBtn =
    "inline-flex items-center gap-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors";
  const sizeCls = large ? "px-4 py-2.5 text-base min-h-[44px]" : "px-3 py-2 text-sm min-h-[40px]";
  const offCls = "border-gray-300 text-gray-900 bg-white hover:bg-gray-50";
  const onCls  = "border-blue-700 text-blue-800 bg-blue-50";
  const MAP = showIcons ? CAT_ICONS : CAT_EMOJI;

  return (
    <>
      {/* MOBILE: one-line chips */}
      <div className="sm:hidden px-4 py-2 overflow-x-auto no-scrollbar -mx-4">
        <div className="flex gap-2 px-4 snap-x snap-mandatory">
          {categories.map((c) => {
            const active = c.id === activeId;
            const icon = MAP[c.id]?.node;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => onPick(c.id)}
                className={["snap-start whitespace-nowrap", baseBtn, sizeCls, active ? onCls : offCls].join(" ")}
              >
                {icon}
                <span className="font-medium">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLET+DESKTOP: 3×2 → 6-up grid */}
      <nav className="hidden sm:block px-4 sm:px-6 py-3">
        <ul className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => {
            const active = c.id === activeId;
            const icon = MAP[c.id]?.node;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onPick(c.id)}
                  className={["w-full justify-center", baseBtn, sizeCls, active ? onCls : offCls].join(" ")}
                >
                  {icon}
                  <span className="font-medium">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}