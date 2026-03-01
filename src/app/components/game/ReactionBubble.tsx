'use client';

import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { REACTIONS, REACTION_DISPLAY_MS } from '@/shared/constants';

interface ReactionBubbleProps {
  playerId: string;
}

export function ReactionBubble({ playerId }: ReactionBubbleProps) {
  const active = useGameStore((s) => s.activeReactions.get(playerId));
  const clearReaction = useGameStore((s) => s.clearReaction);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      clearReaction(playerId);
    }, REACTION_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [active?.timestamp, playerId, clearReaction]);

  if (!active) return null;

  const reaction = REACTIONS.find((r) => r.id === active.reactionId);
  if (!reaction) return null;

  return (
    <div
      key={active.timestamp}
      className="absolute -top-10 left-1/2 z-20 pointer-events-none animate-reaction-pop"
    >
      <div className="bg-coup-surface/95 border border-coup-accent/40 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg whitespace-nowrap">
        <span className="text-base">{reaction.emoji}</span>
        <span className="text-xs font-medium text-gray-200">{reaction.label}</span>
      </div>
    </div>
  );
}
