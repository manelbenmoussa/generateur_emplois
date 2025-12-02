"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  width = "w-48",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${width}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        {selected ? selected.label : placeholder}
      </button>
      {open && (
        <ul className="absolute z-30 mt-2 w-full bg-white border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
