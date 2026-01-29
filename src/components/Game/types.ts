/**
 * Type definitions for Falling Food Arcade Game
 */

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export type ObjectType = 'good' | 'bad';

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: ObjectType;
  emoji: string;
  points: number; // Points awarded (positive for good, negative for bad)
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  emoji: string;
}

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  objectsCaught: number;
  objectsMissed: number;
  startTime: number;
  duration: number; // In seconds
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSpeed: number;
  initialObjectSpeed: number;
  spawnInterval: number; // milliseconds
  maxObjects: number;
  startingLives: number;
  speedIncreaseRate: number; // Per level
  spawnRateIncreaseRate: number; // Per level
}

export interface InputState {
  left: boolean;
  right: boolean;
  touchX: number | null;
}

// Good objects (Tasty Food menu items)
export const GOOD_OBJECTS = [
  { emoji: '🍔', name: 'Smash Burger', points: 100 },
  { emoji: '🍟', name: 'Crousty Fries', points: 50 },
  { emoji: '🥤', name: 'Drink', points: 30 },
  { emoji: '🌯', name: 'Wrap', points: 80 },
  { emoji: '🧃', name: 'Juice', points: 40 },
  { emoji: '🍗', name: 'Crousty Chicken', points: 120 },
] as const;

// Bad objects (things to avoid)
export const BAD_OBJECTS = [
  { emoji: '🔥', name: 'Burnt Food', points: -50 },
  { emoji: '🗑️', name: 'Trash', points: -100 },
  { emoji: '🦠', name: 'Bad Food', points: -75 },
  { emoji: '💀', name: 'Poison', points: -150 },
] as const;

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 400,
  canvasHeight: 600,
  playerSpeed: 8,
  initialObjectSpeed: 2,
  spawnInterval: 1200, // 1.2 seconds
  maxObjects: 15,
  startingLives: 3,
  speedIncreaseRate: 0.3,
  spawnRateIncreaseRate: 0.9, // Multiplier (reduces interval)
};
