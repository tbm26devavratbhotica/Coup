'use client';

import { create } from 'zustand';
import { ChatMessage, ClientGameState, RoomPlayer } from '@/shared/types';

interface GameStore {
  // Connection state
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Room state
  roomCode: string | null;
  playerId: string | null;
  hostId: string | null;
  roomPlayers: RoomPlayer[];
  setRoom: (roomCode: string, playerId: string) => void;
  setRoomPlayers: (players: RoomPlayer[], hostId: string) => void;
  clearRoom: () => void;

  // Game state
  gameState: ClientGameState | null;
  setGameState: (state: ClientGameState | null) => void;

  // Chat state
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  setChatHistory: (messages: ChatMessage[]) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  roomCode: null,
  playerId: null,
  hostId: null,
  roomPlayers: [],
  setRoom: (roomCode, playerId) => set({ roomCode, playerId }),
  setRoomPlayers: (players, hostId) => set({ roomPlayers: players, hostId }),
  clearRoom: () => set({
    roomCode: null,
    playerId: null,
    hostId: null,
    roomPlayers: [],
    gameState: null,
    chatMessages: [],
  }),

  gameState: null,
  setGameState: (state) => set({ gameState: state }),

  chatMessages: [],
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatHistory: (messages) => set({ chatMessages: messages }),

  error: null,
  setError: (error) => set({ error }),
}));
