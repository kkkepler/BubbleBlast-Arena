export const GRID_ROWS = 20;
export const GRID_COLS = 12;
export const BUBBLE_DIAMETER = 42;
export const BUBBLE_RADIUS = 21;
export const COLORS = { 
  blue: '#2979FF', 
  purple: '#D500F9', 
  red: '#FF1744', 
  green: '#00E676', 
  yellow: '#FFD600', 
  orange: '#FF9100' 
};
export const COLOR_NAMES = Object.keys(COLORS) as (keyof typeof COLORS)[];
export const COLOR_VALUES = Object.values(COLORS);
export const STONE_BUBBLE = 'stone';
export const GAME_WIDTH = GRID_COLS * BUBBLE_DIAMETER;
export const GAME_HEIGHT = 850;
export const BASE_SCORE = 10;
export const SCORE_MULTIPLIER_INCREMENT = 20;
export const FALLING_BUBBLE_SCORE = 10;
export const COMBO_BONUS = 30;
