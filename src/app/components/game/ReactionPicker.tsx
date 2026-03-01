'use client';

import { useState, useRef, useEffect } from 'react';
import { REACTIONS } from '@/shared/constants';

interface ReactionPickerProps {
  onReact: (reactionId: string) => void;
  disabled?: boolean;
}

export function ReactionPicker({ onReact, disabled }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="w-5 h-5 rounded-full border border-gray-600 text-gray-400 hover:border-coup-accent hover:text-coup-accent transition text-xs flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        title="Send reaction"
      >
        😄
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 z-30 bg-coup-surface border border-gray-600 rounded-xl p-2 shadow-xl animate-fade-in">
          <div className="grid grid-cols-4 gap-1 w-52">
            {REACTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onReact(r.id);
                  setOpen(false);
                }}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-700/50 transition"
                title={r.label}
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
